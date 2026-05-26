type ImageKitUploadResponse = {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  height?: number;
  width?: number;
  size?: number;
  fileType?: string;
  filePath?: string;
};

export type UploadedMedia = {
  provider_file_id: string;
  name: string;
  alternative_text?: string;
  width?: number;
  height?: number;
  ext?: string;
  mime?: string;
  size?: number;
  url: string;
  thumbnail_url?: string;
};

function imageKitPrivateKey() {
  const key = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
  if (!key) throw new Error("IMAGEKIT_PRIVATE_KEY is not set");
  return key;
}

function fileExtension(filename: string) {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : undefined;
}

export async function uploadImageToImageKit(
  file: File,
  folder = "/articles",
): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("fileName", file.name);
  formData.set("folder", folder);
  formData.set("useUniqueFileName", "true");

  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${imageKitPrivateKey()}:`).toString("base64")}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const message = await imageKitErrorMessage(response);
    throw new Error(message || "Falha ao subir imagem no ImageKit");
  }

  const uploaded = (await response.json()) as ImageKitUploadResponse;

  return {
    provider_file_id: uploaded.fileId,
    name: uploaded.name,
    alternative_text: file.name,
    width: uploaded.width,
    height: uploaded.height,
    ext: fileExtension(uploaded.name || file.name),
    mime: file.type || uploaded.fileType,
    size: uploaded.size ?? file.size,
    url: uploaded.url,
    thumbnail_url: uploaded.thumbnailUrl,
  };
}

export async function deleteImageFromImageKit(fileId: string) {
  const response = await fetch(
    `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${imageKitPrivateKey()}:`).toString("base64")}`,
      },
    },
  );

  if (!response.ok) {
    const message = await imageKitErrorMessage(response);
    throw new Error(message || "Falha ao remover imagem do ImageKit");
  }
}

async function imageKitErrorMessage(response: Response) {
  const text = await response.text();

  try {
    const body = JSON.parse(text) as { message?: string; help?: string };
    return [body.message, body.help].filter(Boolean).join(" ");
  } catch {
    return text;
  }
}
