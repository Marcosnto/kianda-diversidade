/**
 * Presets de recorte por tipo de imagem.
 *
 * As proporções devem espelhar o uso real no site para que a imagem chegue
 * enquadrada corretamente:
 * - Capa de artigo: 4:3 (card de listagem)
 * - Foto do autor: 4:3 (mesmo container do card de artigo)
 */
export type ImageCropPreset = {
  /** Proporção largura / altura. */
  aspect: number;
  /** Largura máxima da imagem final em pixels. */
  maxWidth: number;
  /** Rótulo exibido no diálogo. */
  label: string;
};

export const IMAGE_CROP_PRESETS = {
  articleCover: {
    aspect: 4 / 3,
    maxWidth: 1600,
    label: "Capa do artigo",
  },
  authorAvatar: {
    aspect: 4 / 3,
    maxWidth: 800,
    label: "Foto do autor",
  },
} as const satisfies Record<string, ImageCropPreset>;

export type ImageCropPresetKey = keyof typeof IMAGE_CROP_PRESETS;
