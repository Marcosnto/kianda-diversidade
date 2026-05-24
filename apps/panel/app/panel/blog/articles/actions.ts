"use server";

import { revalidatePath } from "next/cache";
import { deleteArticle } from "@/lib/articles";

export async function deleteArticleAction(id: string): Promise<{
  ok: boolean;
}> {
  await deleteArticle(id);
  revalidatePath("/panel/blog/articles");
  return { ok: true };
}
