import "server-only";

import type { SessionData } from "@auth0/nextjs-auth0/types";
import { auth0 } from "@/lib/auth0";

const ROLES_CLAIM =
  process.env.AUTH0_ROLES_CLAIM ?? "https://kiandadiversidade.com/roles";

export const PERMISSIONS = {
  createArticles: "articles:create",
  readOwnArticles: "articles:read:own",
  updateOwnArticles: "articles:update:own",
  deleteOwnArticles: "articles:delete:own",
  readAnyArticles: "articles:read:any",
  updateAnyArticles: "articles:update:any",
  deleteAnyArticles: "articles:delete:any",
  manageSite: "site:manage",
  readUsers: "users:read",
  manageUsers: "users:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type AppRole = "administrator" | "author" | "patient";

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  administrator: Object.values(PERMISSIONS),
  author: [
    PERMISSIONS.createArticles,
    PERMISSIONS.readOwnArticles,
    PERMISSIONS.updateOwnArticles,
    PERMISSIONS.deleteOwnArticles,
  ],
  patient: [],
};

export type AuthorizationContext = {
  session: SessionData;
  roles: AppRole[];
  permissions: string[];
};

export class AuthenticationError extends Error {
  constructor() {
    super("Usuário não autenticado.");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor() {
    super("Usuário sem permissão para realizar esta ação.");
    this.name = "AuthorizationError";
  }
}

export async function getAuthorizationContext() {
  const session = await auth0.getSession();
  if (!session) return null;

  const accessTokenClaims = parseJwtClaims(session.tokenSet.accessToken);
  const roles = parseRolesFromClaims(
    session.user as Record<string, unknown>,
    accessTokenClaims,
  );
  const permissions = Array.from(
    new Set([
      ...parsePermissions(accessTokenClaims.permissions),
      ...roles.flatMap((role) => ROLE_PERMISSIONS[role]),
    ]),
  );

  return { session, roles, permissions } satisfies AuthorizationContext;
}

export async function requirePermission(permission: Permission) {
  const authorization = await getAuthorizationContext();

  if (!authorization) throw new AuthenticationError();
  if (!hasPermission(authorization, permission)) throw new AuthorizationError();

  return authorization;
}

export async function requireAnyPermission(permissions: Permission[]) {
  const authorization = await getAuthorizationContext();

  if (!authorization) throw new AuthenticationError();
  if (!hasAnyPermission(authorization, permissions)) {
    throw new AuthorizationError();
  }

  return authorization;
}

export function hasPermission(
  authorization: AuthorizationContext,
  permission: Permission,
) {
  return authorization.permissions.includes(permission);
}

export function hasAnyPermission(
  authorization: AuthorizationContext,
  permissions: Permission[],
) {
  return permissions.some((permission) =>
    hasPermission(authorization, permission),
  );
}

export function hasRole(authorization: AuthorizationContext, role: AppRole) {
  return authorization.roles.includes(role);
}

export function getPrimaryRole(authorization: AuthorizationContext) {
  if (hasRole(authorization, "administrator")) return "administrator";
  if (hasRole(authorization, "author")) return "author";
  return "patient";
}

export function canManageOwnedResource({
  authorization,
  ownerId,
  currentUserId,
  ownPermission,
  anyPermission,
}: {
  authorization: AuthorizationContext;
  ownerId: string | null;
  currentUserId: string;
  ownPermission: Permission;
  anyPermission: Permission;
}) {
  if (hasPermission(authorization, anyPermission)) return true;

  return (
    hasPermission(authorization, ownPermission) && ownerId === currentUserId
  );
}

function parseRoles(value: unknown): AppRole[] {
  const values = Array.isArray(value) ? value : [value];

  return Array.from(
    new Set(
      values
        .filter((role): role is string => typeof role === "string")
        .map(normalizeRole)
        .filter((role): role is AppRole => role !== null),
    ),
  );
}

function normalizeRole(role: string): AppRole | null {
  const normalized = role.trim().toLowerCase();

  if (normalized === "administrator" || normalized === "administrador") {
    return "administrator";
  }
  if (normalized === "author" || normalized === "autor") return "author";
  if (normalized === "patient" || normalized === "paciente") return "patient";

  return null;
}

function parseRolesFromClaims(...claimsList: Record<string, unknown>[]) {
  const roleValues = claimsList.flatMap((claims) =>
    Object.entries(claims)
      .filter(([key]) => isRoleClaim(key))
      .map(([, value]) => value),
  );

  return Array.from(new Set(roleValues.flatMap(parseRoles)));
}

function isRoleClaim(key: string) {
  const normalized = key.toLowerCase();

  return (
    key === ROLES_CLAIM ||
    normalized === "role" ||
    normalized === "roles" ||
    normalized.endsWith("/role") ||
    normalized.endsWith("/roles") ||
    normalized.endsWith(":role") ||
    normalized.endsWith(":roles")
  );
}

function parsePermissions(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (permission): permission is string => typeof permission === "string",
      )
    : [];
}

function parseJwtClaims(accessToken: string): Record<string, unknown> {
  const [, payload] = accessToken.split(".");
  if (!payload) return {};

  try {
    return JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Record<string, unknown>;
  } catch {
    return {};
  }
}
