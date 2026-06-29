"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  AtSign,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Youtube,
} from "lucide-react";
import { useState, useTransition, type ComponentType } from "react";
import { toast } from "sonner";
import {
  updateContactChannelsAction,
  type UpdateContactChannelsResult,
} from "./actions";

type SocialField = {
  name:
    | "youtube"
    | "linkedin"
    | "instagram"
    | "threads"
    | "facebook"
    | "whatsapp"
    | "tiktok"
    | "x";
  label: string;
  placeholder: string;
  icon: ComponentType<{ className?: string }>;
};

const SOCIAL_FIELDS: SocialField[] = [
  {
    name: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@kianda",
    icon: Youtube,
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/kianda",
    icon: Linkedin,
  },
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/kiandadiversidade",
    icon: Instagram,
  },
  {
    name: "threads",
    label: "Threads",
    placeholder: "https://threads.net/@kiandadiversidade",
    icon: MessageCircle,
  },
  {
    name: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/kiandadiversidade",
    icon: Facebook,
  },
  {
    name: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/5571999999999",
    icon: MessageCircle,
  },
  {
    name: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@kiandadiversidade",
    icon: Music2,
  },
  {
    name: "x",
    label: "X",
    placeholder: "https://x.com/kiandadiversidade",
    icon: AtSign,
  },
];

type ContactChannelsValues = Record<SocialField["name"], string>;

export function ContactChannelsForm({
  defaults,
}: {
  defaults: ContactChannelsValues;
}) {
  const [values, setValues] = useState(defaults);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result: UpdateContactChannelsResult =
        await updateContactChannelsAction(formData);

      if (!result.ok) {
        toast.error(result.error ?? "Falha ao salvar os links.");
        return;
      }

      toast.success("Links de contato atualizados.");
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {SOCIAL_FIELDS.map(({ name, label, placeholder, icon: Icon }) => (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex items-center gap-2">
              <Icon className="text-muted-foreground size-4" />
              {label}
            </Label>
            <Input
              id={name}
              name={name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [name]: event.target.value,
                }))
              }
              placeholder={placeholder}
              type="url"
              value={values[name]}
            />
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        Redes sem link preenchido não serão exibidas no site.
      </p>

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          {isPending ? "Salvando..." : "Salvar links"}
        </Button>
      </div>
    </form>
  );
}
