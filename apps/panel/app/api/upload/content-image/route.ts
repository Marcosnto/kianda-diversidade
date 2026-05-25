import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { deleteImageFromImageKit } from "@/lib/media";
import { prisma } from "@/lib/prisma";

type DeleteContentImageBody = {
  url?: string;
};

export async function DELETE(request: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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
