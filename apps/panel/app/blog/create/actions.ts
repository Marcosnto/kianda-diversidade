"use server";

import { createArticle, uploadFile } from "@workspace/api";
import { revalidatePath } from "next/cache";

export type CreateArticleResult = {
  ok: boolean;
  error?: string;
};

export async function createArticleAction(
  formData: FormData,
): Promise<CreateArticleResult> {
  const file = formData.get("Capa");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione uma imagem de capa." };
  }

  const media = await uploadFile(file);
  if (!media) return { ok: false, error: "Falha ao subir a imagem de capa." };

  const created = await createArticle({
    Titulo: String(formData.get("Titulo") ?? ""),
    Resumo: String(formData.get("Resumo") ?? ""),
    Conteudo: String(formData.get("Conteudo") ?? ""),
    Publicacao: String(formData.get("Publicacao") ?? ""),
    Destaque: formData.get("Destaque") === "true",
    Capa: media.id,
  });

  if (!created) return { ok: false, error: "Falha ao criar o artigo." };

  // TODO: persistir tags e categorias quando o schema do CMS suportar
  revalidatePath("/blog/articles");
  return { ok: true };
}
