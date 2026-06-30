"use server";

import { createArticle } from "@workspace/db/articles";
import { uploadImageToImageKit } from "@workspace/db/media";
import { prisma } from "@workspace/db/prisma";
import { revalidatePath } from "next/cache";
import { PERMISSIONS, requirePermission } from "@/lib/authorization";
import { getCurrentDatabaseUser } from "@/lib/current-user";

export type CreateArticleResult = {
  ok: boolean;
  error?: string;
};

export async function createArticleAction(
  formData: FormData,
): Promise<CreateArticleResult> {
  const file = formData.get("cover_image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione uma imagem de capa." };
  }

  try {
    await requirePermission(PERMISSIONS.createArticles);
    const author = await getCurrentDatabaseUser();
    const uploaded = await uploadImageToImageKit(file, "/articles/covers");
    const media = await prisma.media.create({ data: uploaded });

    await createArticle({
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      content: String(formData.get("content") ?? ""),
      published_in: parseDate(formData.get("published_in")),
      is_highlight: formData.get("is_highlight") === "true",
      tags: parseStringArray(formData.get("tags")),
      categories: parseStringArray(formData.get("categories")),
      cover_image_id: media.id,
      author_id: author.id,
    });
  } catch (e) {
    console.error("Erro ao criar o artigo", e);
    return { ok: false, error: "Falha ao criar o artigo." };
  }

  revalidatePath("/panel/blog/articles");
  return { ok: true };
}

function parseDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "");
  return text ? new Date(`${text}T00:00:00`) : null;
}

function parseStringArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
  } catch {
    return [];
  }
}
