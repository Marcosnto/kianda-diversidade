"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { cropImageToFile } from "@/lib/crop-image";
import type { ImageCropPreset } from "@/lib/image-crop-presets";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

function clampZoom(value: number) {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

type ImageCropDialogProps = {
  open: boolean;
  file: File | null;
  preset: ImageCropPreset;
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
};

export function ImageCropDialog({
  open,
  file,
  preset,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cria/revoga o objectURL do arquivo selecionado.
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedArea) return;

    setIsProcessing(true);
    try {
      const cropped = await cropImageToFile(imageSrc, croppedArea, {
        maxWidth: preset.maxWidth,
      });
      onConfirm(cropped);
    } finally {
      setIsProcessing(false);
    }
  };

  const aspectLabel = useMemo(() => {
    if (preset.aspect === 1) return "1:1";
    if (Math.abs(preset.aspect - 4 / 3) < 0.01) return "4:3";
    return preset.aspect.toFixed(2);
  }, [preset.aspect]);

  return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next && !isProcessing) onCancel();
			}}
		>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Ajustar enquadramento</DialogTitle>
					<DialogDescription>
						{preset.label} · proporção {aspectLabel}. Arraste para reposicionar
						e use o controle para dar zoom.
					</DialogDescription>
				</DialogHeader>

				<div className="relative h-[min(60vh,420px)] w-full overflow-hidden rounded-lg bg-black/90">
					{imageSrc ? (
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							aspect={preset.aspect}
							minZoom={MIN_ZOOM}
							maxZoom={MAX_ZOOM}
							restrictPosition
							showGrid
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
						/>
					) : (
						<div className="flex h-full items-center justify-center text-sm text-white/70">
							Carregando imagem...
						</div>
					)}
				</div>

				<div className="flex items-center gap-3">
					<Button
						aria-label="Diminuir zoom"
						disabled={!imageSrc || isProcessing || zoom <= MIN_ZOOM}
						onClick={() => setZoom((current) => clampZoom(current - ZOOM_STEP))}
						size="icon-sm"
						type="button"
						variant="outline"
					>
						<ZoomOut />
					</Button>

					<div className="flex flex-1 items-center gap-3">
						<input
							aria-label="Nível de zoom"
							className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!imageSrc || isProcessing}
							id="crop-zoom"
							max={MAX_ZOOM}
							min={MIN_ZOOM}
							onChange={(event) => setZoom(Number(event.target.value))}
							step={0.01}
							type="range"
							value={zoom}
						/>
						<span className="text-muted-foreground w-12 shrink-0 text-right text-xs font-medium tabular-nums">
							{Math.round(zoom * 100)}%
						</span>
					</div>

					<Button
						aria-label="Aumentar zoom"
						disabled={!imageSrc || isProcessing || zoom >= MAX_ZOOM}
						onClick={() => setZoom((current) => clampZoom(current + ZOOM_STEP))}
						size="icon-sm"
						type="button"
						variant="outline"
					>
						<ZoomIn />
					</Button>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isProcessing}
					>
						Cancelar
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={!croppedArea || isProcessing}
					>
						{isProcessing && <Loader2 className="animate-spin" />}
						{isProcessing ? "Processando..." : "Aplicar corte"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
