export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropImageOptions = {
  /** Largura máxima da imagem final em pixels. Padrão: sem limite. */
  maxWidth?: number;
  /** MIME type de saída. Padrão: image/jpeg. */
  mimeType?: string;
  /** Qualidade de compressão (0–1) para formatos com perda. Padrão: 0.9. */
  quality?: number;
};

/**
 * Recorta uma imagem usando Canvas e devolve um `File` pronto para upload.
 *
 * A fonte deve ser um `objectURL` local (mesma origem) para evitar problemas de
 * CORS ao desenhar no canvas.
 */
export async function cropImageToFile(
  imageSrc: string,
  crop: PixelCrop,
  options: CropImageOptions = {},
): Promise<File> {
  const { maxWidth, mimeType = "image/jpeg", quality = 0.9 } = options;

  const image = await loadImage(imageSrc);

  // Escala proporcional caso a largura do recorte exceda o limite.
  const scale = maxWidth && crop.width > maxWidth ? maxWidth / crop.width : 1;
  const outputWidth = Math.max(1, Math.round(crop.width * scale));
  const outputHeight = Math.max(1, Math.round(crop.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Não foi possível processar a imagem.");
  }

  // Fundo branco evita transparência virar preto ao exportar em JPEG.
  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, outputWidth, outputHeight);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const blob = await canvasToBlob(canvas, mimeType, quality);

  return new File([blob], buildFileName(imageSrc, mimeType), {
    type: mimeType,
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Falha ao gerar a imagem recortada."));
      },
      mimeType,
      quality,
    );
  });
}

function buildFileName(imageSrc: string, mimeType: string) {
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const base = imageSrc.startsWith("blob:")
    ? `recorte-${Date.now()}`
    : imageSrc
        .split("/")
        .pop()
        ?.split("?")[0]
        ?.replace(/\.[^.]+$/, "");

  return `${base || `recorte-${Date.now()}`}.${extension}`;
}
