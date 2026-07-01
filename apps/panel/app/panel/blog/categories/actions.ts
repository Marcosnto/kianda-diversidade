"use server";

import {
  CategoryNameConflictError,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@workspace/db/categories";
import { revalidatePath } from "next/cache";
import { PERMISSIONS, requirePermission } from "@/lib/authorization";

export type CategoryActionResult = {
  ok: boolean;
  error?: string;
};

export async function createCategoryAction(
  name: string,
): Promise<CategoryActionResult> {
  try {
    await requirePermission(PERMISSIONS.manageSite);
    await createCategory(parseCategoryName(name));
    revalidateCategories();
    return { ok: true };
  } catch (error) {
    return categoryActionError(error, "Não foi possível criar a categoria.");
  }
}

export async function updateCategoryAction(
  id: number,
  name: string,
): Promise<CategoryActionResult> {
  try {
    await requirePermission(PERMISSIONS.manageSite);
    await updateCategory(parseCategoryId(id), parseCategoryName(name));
    revalidateCategories();
    return { ok: true };
  } catch (error) {
    return categoryActionError(
      error,
      "Não foi possível atualizar a categoria.",
    );
  }
}

export async function deleteCategoryAction(
  id: number,
): Promise<CategoryActionResult> {
  try {
    await requirePermission(PERMISSIONS.manageSite);
    await deleteCategory(parseCategoryId(id));
    revalidateCategories();
    return { ok: true };
  } catch (error) {
    return categoryActionError(error, "Não foi possível remover a categoria.");
  }
}

function parseCategoryName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");

  if (name.length < 2) {
    throw new Error("Informe um nome com pelo menos 2 caracteres.");
  }
  if (name.length > 80) {
    throw new Error("O nome deve ter no máximo 80 caracteres.");
  }

  return name;
}

function parseCategoryId(value: number) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Categoria inválida.");
  }

  return value;
}

function categoryActionError(error: unknown, fallback: string) {
  if (error instanceof CategoryNameConflictError) {
    return { ok: false, error: error.message };
  }

  console.error(fallback, error);
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

function revalidateCategories() {
  revalidatePath("/panel/blog/categories");
  revalidatePath("/panel/blog", "layout");
}
