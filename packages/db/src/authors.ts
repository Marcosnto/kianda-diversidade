import { prisma } from "./prisma";

function publishedArticleWhere() {
  return {
    published_in: {
      lte: new Date(),
    },
  } as const;
}

function publicAuthorSelect() {
  return {
    id: true,
    name: true,
    picture: true,
    bio: true,
    website: true,
    instagram: true,
    linkedin: true,
    youtube: true,
    tiktok: true,
    x: true,
    _count: {
      select: {
        articles: {
          where: publishedArticleWhere(),
        },
      },
    },
  } as const;
}

export type PublicAuthorListItem = Awaited<
  ReturnType<typeof getPublishedAuthors>
>[number];

export type PublicAuthor = Awaited<ReturnType<typeof getPublishedAuthorById>>;

export async function getPublishedAuthors() {
  return prisma.user.findMany({
    where: {
      articles: {
        some: publishedArticleWhere(),
      },
    },
    select: publicAuthorSelect(),
    orderBy: { name: "asc" },
  });
}

export async function getPublishedAuthorById(id: string) {
  return prisma.user.findFirst({
    where: {
      id,
      articles: {
        some: publishedArticleWhere(),
      },
    },
    select: {
      ...publicAuthorSelect(),
      articles: {
        where: publishedArticleWhere(),
        include: {
          cover_image: true,
          tags: true,
          categories: true,
        },
        orderBy: [{ published_in: "desc" }, { created_at: "desc" }],
      },
    },
  });
}
