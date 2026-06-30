"use server";

import {
  deleteImageFromImageKit,
  uploadImageToImageKit,
} from "@workspace/db/media";
import { prisma } from "@workspace/db/prisma";
import { updateUserPicture } from "@workspace/db/users";
import { revalidatePath } from "next/cache";
import { getCurrentDatabaseUser } from "@/lib/current-user";

export type UpdateAccountPictureResult = {
  ok: boolean;
  picture?: string | null;
  error?: string;
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function updateAccountPictureAction(
  formData: FormData,
): Promise<UpdateAccountPictureResult> {
  const file = formData.get("picture");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione uma imagem para o perfil." };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Use uma imagem JPG, PNG, WEBP ou GIF.",
    };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "A imagem deve ter no máximo 5MB." };
  }

  try {
    const user = await getCurrentDatabaseUser();
    const uploaded = await uploadImageToImageKit(file, "/users/avatars");
    const media = await prisma.media.create({ data: uploaded });

    await updateUserPicture(user.id, media.url);
    await deletePreviousProfileMedia(user.picture);

    revalidatePath("/panel/account");
    revalidatePath("/panel", "layout");

    return { ok: true, picture: media.url };
  } catch (error) {
    console.error("Erro ao atualizar imagem do perfil", error);
    return { ok: false, error: "Falha ao atualizar a imagem do perfil." };
  }
}

async function deletePreviousProfileMedia(picture: string | null) {
  if (!picture) return;

  const media = await prisma.media.findFirst({ where: { url: picture } });
  if (!media) return;

  try {
    await deleteImageFromImageKit(media.provider_file_id);
    await prisma.media.delete({ where: { id: media.id } });
  } catch (error) {
    console.error("Erro ao remover imagem anterior do perfil", error);
  }
}
