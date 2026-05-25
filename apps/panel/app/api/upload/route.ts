import { uploadImageToImageKit } from "@/lib/media";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Arquivo ausente" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Tipo de arquivo não suportado" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Arquivo maior que 5MB" }, { status: 413 });
  }

  try {
    const uploaded = await uploadImageToImageKit(file, "/articles/content");
    return Response.json({ url: uploaded.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload";

    return Response.json({ error: message }, { status: 500 });
  }
}
