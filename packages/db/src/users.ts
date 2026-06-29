import { prisma } from "./prisma";

export type UpsertAuthUserInput = {
  auth0_id: string;
  name: string;
  email?: string | null;
  picture?: string | null;
};

export async function upsertAuthUser(input: UpsertAuthUserInput) {
  return prisma.user.upsert({
    where: {
      auth0_id: input.auth0_id,
    },
    create: {
      auth0_id: input.auth0_id,
      name: input.name,
      email: input.email,
      picture: input.picture,
    },
    update: {
      name: input.name,
      email: input.email,
      picture: input.picture,
    },
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
}
