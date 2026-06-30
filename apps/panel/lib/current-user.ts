import { upsertAuthUser } from "@workspace/db/users";
import { auth0 } from "@/lib/auth0";

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function isEmailLike(value: string | null, email: string | null) {
  return !!value && !!email && value.toLowerCase() === email.toLowerCase();
}

function getCurrentUserName(user: Record<string, unknown>) {
  const email = optionalString(user.email);
  const givenName = optionalString(user.given_name);
  const familyName = optionalString(user.family_name);
  const fullName = [givenName, familyName].filter(Boolean).join(" ").trim();
  const name = optionalString(user.name);
  const nickname = optionalString(user.nickname);
  const username = optionalString(user.username);

  if (fullName) return fullName;
  if (name && !isEmailLike(name, email)) return name;
  if (nickname && !isEmailLike(nickname, email)) return nickname;
  if (username && !isEmailLike(username, email)) return username;

  return email?.split("@")[0] || "Usuário";
}

export async function getCurrentDatabaseUser() {
  const session = await auth0.getSession();
  const sessionUser = (session?.user ?? {}) as Record<string, unknown>;
  const auth0Id = optionalString(sessionUser.sub);

  if (!auth0Id) {
    throw new Error("Usuário não autenticado.");
  }

  return upsertAuthUser({
    auth0_id: auth0Id,
    name: getCurrentUserName(sessionUser),
    email: optionalString(sessionUser.email),
    picture: optionalString(sessionUser.picture),
  });
}
