"use server";

import { deleteArticle } from "@workspace/db/articles";
import { revalidatePath } from "next/cache";

export async function deleteArticleAction(id: string): Promise<{
  ok: boolean;
}> {
  await deleteArticle(id);
  revalidatePath("/panel/blog/articles");
  return { ok: true };
}
