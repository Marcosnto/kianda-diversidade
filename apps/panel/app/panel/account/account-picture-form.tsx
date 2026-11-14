"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import { LoadingButton } from "@/components/loading-button";
import { IMAGE_CROP_PRESETS } from "@/lib/image-crop-presets";
import {
  type UpdateAccountPictureResult,
  updateAccountPictureAction,
} from "./actions";

type AccountPictureFormProps = {
  name: string;
  picture: string | null;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AccountPictureForm({ name, picture }: AccountPictureFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(picture);
  const [fileName, setFileName] = useState("");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [isCropOpen, setIsCropOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = (formData: FormData) => {
    if (croppedFile) {
			formData.set("picture", croppedFile);
		}

    startTransition(async () => {
      const result: UpdateAccountPictureResult =
        await updateAccountPictureAction(formData);

      if (!result.ok) {
        toast.error(result.error ?? "Falha ao atualizar a imagem.");
        return;
      }

      setPreview(result.picture ?? null);
      setFileName("");
      setCroppedFile(null);
      formRef.current?.reset();
      router.refresh();
      toast.success("Imagem do perfil atualizada.");
    });
  };

  return (
		<form
			action={handleSubmit}
			className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-5"
			ref={formRef}
		>
			<Avatar className="size-20 shrink-0 rounded-lg sm:size-24">
				<AvatarImage
					className="object-cover"
					src={preview ?? undefined}
					alt={name}
				/>
				<AvatarFallback className="rounded-lg text-xl font-semibold">
					{getInitials(name) || "KD"}
				</AvatarFallback>
			</Avatar>

			<div className="grid min-w-0 flex-1 gap-3">
				<div className="grid gap-2">
					<Label htmlFor="picture" className="flex items-center gap-2">
						<Camera className="text-muted-foreground size-4" />
						Imagem do perfil
					</Label>
					<Input
						accept="image/jpeg,image/png,image/webp,image/gif"
						className="w-full"
						disabled={isPending}
						id="picture"
						name="picture"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) {
								setPendingFile(file);
								setIsCropOpen(true);
							}
							// Permite selecionar o mesmo arquivo novamente.
							event.target.value = "";
						}}
						type="file"
					/>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<LoadingButton
						loading={isPending}
						loadingText="Atualizando..."
						disabled={!croppedFile}
						type="submit"
					>
						Atualizar imagem
					</LoadingButton>
					<p className="text-muted-foreground text-xs leading-relaxed">
						JPG, PNG, WEBP ou GIF até 5MB. Você poderá ajustar o enquadramento.
					</p>
				</div>
			</div>

			<ImageCropDialog
				open={isCropOpen}
				file={pendingFile}
				preset={IMAGE_CROP_PRESETS.authorAvatar}
				onCancel={() => {
					setIsCropOpen(false);
					setPendingFile(null);
				}}
				onConfirm={(cropped) => {
					setCroppedFile(cropped);
					setFileName(cropped.name);
					setPreview((current) => {
						if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
						return URL.createObjectURL(cropped);
					});
					setIsCropOpen(false);
					setPendingFile(null);
				}}
			/>
		</form>
	);
}
