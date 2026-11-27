"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  EMAIL_TEMPLATE_PLACEHOLDERS,
  renderEmail,
} from "@/lib/email-template-render";
import { saveWelcomeTemplateAction } from "./actions";

type WelcomeTemplateFormProps = {
  initialSubject: string;
  initialBody: string;
  siteUrl: string;
};

export function WelcomeTemplateForm({
  initialSubject,
  initialBody,
  siteUrl,
}: WelcomeTemplateFormProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isPending, startTransition] = useTransition();

  const preview = useMemo(
    () =>
      renderEmail(body, {
        siteName: "Kianda Diversidade",
        siteUrl,
        year: new Date().getFullYear(),
        unsubscribeUrl: `${siteUrl}/newsletter/descadastrar?token=exemplo`,
      }),
    [body, siteUrl],
  );

  const insertPlaceholder = (token: string) => {
    setBody(
      (current) => `${current}${current.endsWith("\n") ? "" : "\n"}${token}`,
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.set("subject", subject);
    formData.set("body", body);

    startTransition(async () => {
      const result = await saveWelcomeTemplateAction(formData);
      if (!result.ok) {
        toast.error(result.error ?? "Falha ao salvar o modelo.");
        return;
      }
      toast.success("Modelo de boas-vindas atualizado.");
    });
  };

  return (
    <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject">Assunto do e-mail</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Bem vindo à Newsletter do Kianda Diversidade!"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="body">Conteúdo</Label>
          <Textarea
            id="body"
            className="min-h-[420px] font-mono text-sm"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
          />
          <p className="text-muted-foreground text-xs">
            Separe os parágrafos com uma linha em branco.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Marcadores disponíveis</p>
          <div className="flex flex-wrap gap-2">
            {EMAIL_TEMPLATE_PLACEHOLDERS.map((placeholder) => (
              <Button
                key={placeholder.token}
                type="button"
                variant="outline"
                size="sm"
                title={placeholder.description}
                onClick={() => insertPlaceholder(placeholder.token)}
              >
                {placeholder.token}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar modelo"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Pré-visualização</p>
        <div className="bg-muted/40 overflow-hidden rounded-lg border">
          <div className="border-b px-4 py-2 text-xs">
            <span className="text-muted-foreground">Assunto: </span>
            <span className="font-medium">{subject || "(sem assunto)"}</span>
          </div>
          <iframe
            title="Pré-visualização do e-mail de boas-vindas"
            className="h-[520px] w-full bg-white"
            srcDoc={preview.html}
          />
        </div>
      </div>
    </form>
  );
}
