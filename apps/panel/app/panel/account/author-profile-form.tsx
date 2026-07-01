"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateAuthorProfileAction } from "./actions";

type AuthorProfileFormProps = {
  defaults: {
    bio: string;
    website: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    x: string;
  };
};

const SOCIAL_FIELDS = [
  { name: "website", label: "Site", placeholder: "www.seusite.com" },
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "www.instagram.com/seu-perfil",
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "www.linkedin.com/in/seu-perfil",
  },
  {
    name: "youtube",
    label: "YouTube",
    placeholder: "www.youtube.com/@seu-canal",
  },
  {
    name: "tiktok",
    label: "TikTok",
    placeholder: "www.tiktok.com/@seu-perfil",
  },
  { name: "x", label: "X", placeholder: "www.x.com/seu-perfil" },
] as const;

export function AuthorProfileForm({ defaults }: AuthorProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateAuthorProfileAction(formData);

      if (!result.ok) {
        toast.error(result.error ?? "Falha ao atualizar o perfil público.");
        return;
      }

      toast.success("Perfil público atualizado.");
      router.refresh();
    });
  };

  return (
    <form action={submit} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          defaultValue={defaults.bio}
          disabled={isPending}
          id="bio"
          maxLength={1500}
          name="bio"
          placeholder="Conte um pouco sobre sua atuação, formação e interesses."
          rows={6}
        />
        <p className="text-muted-foreground text-xs">
          Essa apresentação será exibida na sua página pública de autor.
        </p>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={isPending}>
        <legend className="mb-3 text-sm font-semibold sm:col-span-2">
          Links e redes sociais
        </legend>
        {SOCIAL_FIELDS.map((field) => (
          <div className="grid gap-2" key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              defaultValue={defaults[field.name]}
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              inputMode="url"
              type="text"
            />
          </div>
        ))}
      </fieldset>

      <Button className="w-full sm:w-fit" disabled={isPending} type="submit">
        {isPending ? "Salvando..." : "Salvar perfil público"}
      </Button>
    </form>
  );
}
