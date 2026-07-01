import { prisma } from "./prisma";

export class CategoryNameConflictError extends Error {
  constructor() {
    super("Já existe uma categoria com esse nome.");
    this.name = "CategoryNameConflictError";
  }
}

export type PanelCategoryListItem = Awaited<
  ReturnType<typeof getCategories>
>[number];

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
}

export async function createCategory(name: string) {
  await ensureUniqueCategoryName(name);

  return prisma.category.create({
    data: { name },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
}

export async function updateCategory(id: number, name: string) {
  await ensureUniqueCategoryName(name, id);

  return prisma.category.update({
    where: { id },
    data: { name },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } });
}

async function ensureUniqueCategoryName(name: string, ignoredId?: number) {
  const existing = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      ...(ignoredId ? { id: { not: ignoredId } } : {}),
    },
    select: { id: true },
  });

  if (existing) throw new CategoryNameConflictError();
}
