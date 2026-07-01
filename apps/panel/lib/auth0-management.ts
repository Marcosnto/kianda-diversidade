import "server-only";

const MANAGED_ROLE_NAMES = ["administrator", "author", "patient"] as const;

export type ManagedRoleName = (typeof MANAGED_ROLE_NAMES)[number];

export type Auth0Role = {
  id: string;
  name: string;
  description?: string;
};

type ManagementToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: ManagementToken | null = null;

export async function getManagedRoles() {
  const roles = await managementRequest<Auth0Role[]>("/roles?per_page=100");

  return roles.filter((role) => isManagedRoleName(role.name));
}

export async function getUserManagedRoles(auth0Id: string) {
  const roles = await managementRequest<Auth0Role[]>(
    `/users/${encodeURIComponent(auth0Id)}/roles?per_page=100`,
  );

  return roles.filter((role) => isManagedRoleName(role.name));
}

export async function getManagedRoleAssignments(auth0Ids: string[]) {
  const entries = await Promise.all(
    auth0Ids.map(async (auth0Id) => {
      const roles = await getUserManagedRoles(auth0Id);
      return [auth0Id, roles.map((role) => role.name)] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<string, string[]>;
}

export async function setUserManagedRole(
  auth0Id: string,
  roleName: ManagedRoleName | null,
) {
  const [managedRoles, currentRoles] = await Promise.all([
    getManagedRoles(),
    getUserManagedRoles(auth0Id),
  ]);
  const selectedRole = roleName
    ? managedRoles.find((role) => role.name.toLowerCase() === roleName)
    : null;

  if (roleName && !selectedRole) {
    throw new Error(`A role ${roleName} não existe no Auth0.`);
  }

  const rolesToRemove = currentRoles
    .filter((role) => role.id !== selectedRole?.id)
    .map((role) => role.id);

  if (rolesToRemove.length > 0) {
    await managementRequest(`/users/${encodeURIComponent(auth0Id)}/roles`, {
      method: "DELETE",
      body: JSON.stringify({ roles: rolesToRemove }),
    });
  }

  const alreadyAssigned = currentRoles.some(
    (role) => role.id === selectedRole?.id,
  );

  if (selectedRole && !alreadyAssigned) {
    await managementRequest(`/users/${encodeURIComponent(auth0Id)}/roles`, {
      method: "POST",
      body: JSON.stringify({ roles: [selectedRole.id] }),
    });
  }
}

export function isManagedRoleName(value: string): value is ManagedRoleName {
  return MANAGED_ROLE_NAMES.includes(value.toLowerCase() as ManagedRoleName);
}

async function managementRequest<T = void>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { domain } = getManagementConfig();
  const accessToken = await getManagementToken();
  const response = await fetch(`https://${domain}/api/v2${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `Auth0 respondeu com ${response.status}.`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function getManagementToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const { domain, audience, clientId, clientSecret } = getManagementConfig();
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  } | null;

  if (!response.ok || !body?.access_token) {
    throw new Error(
      body?.error_description ??
        "Não foi possível autenticar na Management API.",
    );
  }

  cachedToken = {
    accessToken: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };

  return cachedToken.accessToken;
}

function getManagementConfig() {
  const domain = process.env.AUTH0_MANAGEMENT_DOMAIN?.replace(
    /^https?:\/\//,
    "",
  ).replace(/\/$/, "");
  const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error(
      "A integração com a Auth0 Management API não foi configurada.",
    );
  }

  return {
    domain,
    clientId,
    clientSecret,
    audience:
      process.env.AUTH0_MANAGEMENT_AUDIENCE ?? `https://${domain}/api/v2/`,
  };
}
