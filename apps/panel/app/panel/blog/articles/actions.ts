"use server";

import { deleteArticle } from "@workspace/api";
import { revalidatePath } from "next/cache";

export async function deleteArticleAction(documentId: string): Promise<{
  ok: boolean;
}> {
  const ok = await deleteArticle(documentId);
  if (ok) revalidatePath("/panel/blog/articles");
  return { ok };
}
