"use server";

import { updateArticle, uploadFile, type UpdateArticleInput } from "@workspace/api";
import { revalidatePath } from "next/cache";

export type UpdateArticleResult = {
  ok: boolean;
  error?: string;
};

export async function updateArticleAction(
  documentId: string,
  formData: FormData,
): Promise<UpdateArticleResult> {
  const input: UpdateArticleInput = {
    Titulo: String(formData.get("Titulo") ?? ""),
    Resumo: String(formData.get("Resumo") ?? ""),
    Conteudo: String(formData.get("Conteudo") ?? ""),
    Publicacao: String(formData.get("Publicacao") ?? ""),
    Destaque: formData.get("Destaque") === "true",
  };

  const file = formData.get("Capa");
  if (file instanceof File && file.size > 0) {
    const media = await uploadFile(file);
    if (!media) return { ok: false, error: "Falha ao subir a nova imagem." };
    input.Capa = media.id;
  }

  const updated = await updateArticle(documentId, input);
  if (!updated) return { ok: false, error: "Falha ao atualizar o artigo." };

  // TODO: persistir tags e categorias quando o schema do CMS suportar
  revalidatePath("/panel/blog/articles");
  revalidatePath(`/panel/blog/articles/${documentId}/edit`);
  return { ok: true };
}
