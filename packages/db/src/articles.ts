import { prisma } from "./prisma";

const articleInclude = {
  cover_image: true,
  author: true,
  tags: true,
  categories: true,
} as const;

export type PanelArticle = Awaited<ReturnType<typeof getArticleById>>;
export type PanelArticleListItem = Awaited<
  ReturnType<typeof getArticles>
>[number];

export type ArticleInput = {
  title: string;
  summary: string;
  content: string;
  published_in: Date | null;
  is_highlight: boolean;
  tags: string[];
  categories: string[];
  cover_image_id?: string;
};

export type CreateArticleInput = ArticleInput & {
  author_id: string;
};

function createRelationByNames(names: string[]) {
  const uniqueNames = Array.from(
    new Set(names.map((name) => name.trim()).filter(Boolean)),
  );

  return {
    connectOrCreate: uniqueNames.map((name) => ({
      where: { name },
      create: { name },
    })),
  };
}

function updateRelationByNames(names: string[]) {
  return {
    set: [],
    ...createRelationByNames(names),
  };
}

export type { ArticleStatus } from "./article-status";

export async function getArticles() {
  return prisma.article.findMany({
    include: articleInclude,
    orderBy: [{ published_in: "desc" }, { created_at: "desc" }],
  });
}

export async function getArticlesByAuthorId(authorId: string) {
  return prisma.article.findMany({
    where: { author_id: authorId },
    include: articleInclude,
    orderBy: [{ published_in: "desc" }, { created_at: "desc" }],
  });
}

export async function getPublishedArticles() {
  return prisma.article.findMany({
    where: {
      published_in: {
        lte: new Date(),
      },
    },
    include: articleInclude,
    orderBy: [{ published_in: "desc" }, { created_at: "desc" }],
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: articleInclude,
  });
}

export async function getPublishedArticleById(id: string) {
  return prisma.article.findFirst({
    where: {
      id,
      published_in: {
        lte: new Date(),
      },
    },
    include: articleInclude,
  });
}

export async function createArticle(input: CreateArticleInput) {
  return prisma.article.create({
    data: {
      title: input.title,
      summary: input.summary,
      content: input.content,
      published_in: input.published_in,
      is_highlight: input.is_highlight,
      cover_image: input.cover_image_id
        ? {
            connect: {
              id: input.cover_image_id,
            },
          }
        : undefined,
      author: {
        connect: {
          id: input.author_id,
        },
      },
      tags: createRelationByNames(input.tags),
      categories: createRelationByNames(input.categories),
    },
    include: articleInclude,
  });
}

export async function updateArticle(id: string, input: ArticleInput) {
  return prisma.article.update({
    where: { id },
    data: {
      title: input.title,
      summary: input.summary,
      content: input.content,
      published_in: input.published_in,
      is_highlight: input.is_highlight,
      ...(input.cover_image_id ? { cover_image_id: input.cover_image_id } : {}),
      tags: updateRelationByNames(input.tags),
      categories: updateRelationByNames(input.categories),
    },
    include: articleInclude,
  });
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
}
