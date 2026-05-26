"use server";

import { updateArticle } from "@workspace/db/articles";
import { uploadImageToImageKit } from "@workspace/db/media";
import { prisma } from "@workspace/db/prisma";
import { revalidatePath } from "next/cache";

export type UpdateArticleResult = {
  ok: boolean;
  error?: string;
};

export async function updateArticleAction(
  id: string,
  formData: FormData,
): Promise<UpdateArticleResult> {
  try {
    let coverImageId: string | undefined;

    const file = formData.get("cover_image");
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadImageToImageKit(file, "/articles/covers");
      const media = await prisma.media.create({ data: uploaded });
      coverImageId = media.id;
    }

    await updateArticle(id, {
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      content: String(formData.get("content") ?? ""),
      published_in: parseDate(formData.get("published_in")),
      is_highlight: formData.get("is_highlight") === "true",
      tags: parseStringArray(formData.get("tags")),
      categories: parseStringArray(formData.get("categories")),
      cover_image_id: coverImageId,
    });
  } catch {
    return { ok: false, error: "Falha ao atualizar o artigo." };
  }

  revalidatePath("/panel/blog/articles");
  revalidatePath(`/panel/blog/articles/${id}/edit`);
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
