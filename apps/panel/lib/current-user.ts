import { upsertAuthUser } from "@workspace/db/users";
import { auth0 } from "@/lib/auth0";

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

export async function getCurrentDatabaseUser() {
  const session = await auth0.getSession();
  const auth0Id = optionalString(session?.user.sub);

  if (!auth0Id) {
    throw new Error("Usuário não autenticado.");
  }

  const name =
    optionalString(session?.user.name) ??
    optionalString(session?.user.nickname) ??
    optionalString(session?.user.email) ??
    "Usuário";

  return upsertAuthUser({
    auth0_id: auth0Id,
    name,
    email: optionalString(session?.user.email),
    picture: optionalString(session?.user.picture),
  });
}
