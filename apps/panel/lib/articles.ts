import { prisma } from "@/lib/prisma";

const articleInclude = {
  cover_image: true,
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

function relationByNames(names: string[]) {
  const uniqueNames = Array.from(
    new Set(names.map((name) => name.trim()).filter(Boolean)),
  );

  return {
    set: [],
    connectOrCreate: uniqueNames.map((name) => ({
      where: { name },
      create: { name },
    })),
  };
}

export type { ArticleStatus } from "@/lib/article-status";

export async function getArticles() {
  return prisma.article.findMany({
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

export async function createArticle(input: ArticleInput) {
  return prisma.article.create({
    data: {
      title: input.title,
      summary: input.summary,
      content: input.content,
      published_in: input.published_in,
      is_highlight: input.is_highlight,
      cover_image_id: input.cover_image_id,
      tags: relationByNames(input.tags),
      categories: relationByNames(input.categories),
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
      tags: relationByNames(input.tags),
      categories: relationByNames(input.categories),
    },
    include: articleInclude,
  });
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
}
