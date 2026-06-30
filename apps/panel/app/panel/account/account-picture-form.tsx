"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result: UpdateAccountPictureResult =
        await updateAccountPictureAction(formData);

      if (!result.ok) {
        toast.error(result.error ?? "Falha ao atualizar a imagem.");
        return;
      }

      setPreview(result.picture ?? null);
      setFileName("");
      formRef.current?.reset();
      router.refresh();
      toast.success("Imagem do perfil atualizada.");
    });
  };

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-4 sm:flex-row sm:items-center"
      ref={formRef}
    >
      <Avatar className="size-20 rounded-lg sm:size-24">
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
            disabled={isPending}
            id="picture"
            name="picture"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name ?? "");
              if (file) {
                const nextPreview = URL.createObjectURL(file);
                setPreview((current) => {
                  if (current?.startsWith("blob:")) {
                    URL.revokeObjectURL(current);
                  }
                  return nextPreview;
                });
              }
            }}
            type="file"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button disabled={isPending || !fileName} type="submit">
            {isPending ? "Atualizando..." : "Atualizar imagem"}
          </Button>
          <p className="text-muted-foreground text-xs">
            JPG, PNG, WEBP ou GIF até 5MB.
          </p>
        </div>
      </div>
    </form>
  );
}
