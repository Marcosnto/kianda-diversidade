"use server";

import { deleteArticle, getArticleById } from "@workspace/db/articles";
import { revalidatePath } from "next/cache";
import {
  canManageOwnedResource,
  PERMISSIONS,
  requireAnyPermission,
} from "@/lib/authorization";
import { getCurrentDatabaseUser } from "@/lib/current-user";

export async function deleteArticleAction(id: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const authorization = await requireAnyPermission([
      PERMISSIONS.deleteOwnArticles,
      PERMISSIONS.deleteAnyArticles,
    ]);
    const [article, user] = await Promise.all([
      getArticleById(id),
      getCurrentDatabaseUser(),
    ]);

    if (
      !article ||
      !canManageOwnedResource({
        authorization,
        ownerId: article.author_id,
        currentUserId: user.id,
        ownPermission: PERMISSIONS.deleteOwnArticles,
        anyPermission: PERMISSIONS.deleteAnyArticles,
      })
    ) {
      return { ok: false, error: "Você não pode remover este artigo." };
    }

    await deleteArticle(id);
    revalidatePath("/panel/blog/articles");
    return { ok: true };
  } catch (error) {
    console.error("Erro ao remover artigo", error);
    return { ok: false, error: "Falha ao remover o artigo." };
  }
}
