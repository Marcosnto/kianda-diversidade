import { deleteImageFromImageKit } from "@workspace/db/media";
import { prisma } from "@workspace/db/prisma";
import { NextResponse } from "next/server";
import {
  AuthenticationError,
  AuthorizationError,
  PERMISSIONS,
  requireAnyPermission,
} from "@/lib/authorization";

type DeleteContentImageBody = {
  url?: string;
};

export async function DELETE(request: Request) {
  try {
    await requireAnyPermission([
      PERMISSIONS.updateOwnArticles,
      PERMISSIONS.updateAnyArticles,
    ]);
  } catch (error) {
    const status = error instanceof AuthenticationError ? 401 : 403;
    const message =
      error instanceof AuthorizationError
        ? "Você não tem permissão para remover imagens."
        : "Não autorizado.";
    return NextResponse.json({ error: message }, { status });
  }

  const body = (await request
    .json()
    .catch(() => null)) as DeleteContentImageBody | null;
  const url = body?.url?.trim();

  if (!url) {
    return NextResponse.json({ error: "URL ausente." }, { status: 400 });
  }

  const media = await prisma.media.findFirst({ where: { url } });

  if (!media) {
    return NextResponse.json({ ok: true });
  }

  try {
    await deleteImageFromImageKit(media.provider_file_id);
    await prisma.media.delete({ where: { id: media.id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao remover imagem do conteúdo." },
      { status: 500 },
    );
  }
}
