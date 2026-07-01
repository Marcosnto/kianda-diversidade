import { prisma } from "./prisma";

export type UpsertAuthUserInput = {
  auth0_id: string;
  name: string;
  email?: string | null;
  picture?: string | null;
};

export type AuthorProfileInput = {
  bio: string | null;
  website: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  tiktok: string | null;
  x: string | null;
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

export type PanelUserListItem = Awaited<ReturnType<typeof getUsers>>[number];

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: [{ created_at: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
}

export async function updateUserPicture(id: string, picture: string | null) {
  return prisma.user.update({
    where: { id },
    data: { picture },
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
}

export async function updateAuthorProfile(
  id: string,
  profile: AuthorProfileInput,
) {
  return prisma.user.update({
    where: { id },
    data: profile,
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
}
