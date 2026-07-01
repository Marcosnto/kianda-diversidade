import {
  Auth0Client,
  filterDefaultIdTokenClaims,
} from "@auth0/nextjs-auth0/server";

const rolesClaim =
  process.env.AUTH0_ROLES_CLAIM ?? "https://kiandadiversidade.com/roles";

export const auth0 = new Auth0Client({
  beforeSessionSaved: async (session) => ({
    ...session,
    user: {
      ...filterDefaultIdTokenClaims(session.user),
      ...(session.user[rolesClaim] !== undefined
        ? { [rolesClaim]: session.user[rolesClaim] }
        : {}),
    },
  }),
});
