"use client";

import { getArticleStatus } from "@workspace/db/article-status";
import type { PanelArticleListItem } from "@workspace/db/articles";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { Eye, Loader2, Save, Send } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/loading-button";
import {
  DEFAULT_NEWSLETTER_GREETING,
  NEWSLETTER_TEMPLATE_PLACEHOLDERS,
} from "@/lib/newsletter-template";
import {
  type NewsletterPreview,
  previewNewsletterAction,
  saveNewsletterTemplateAction,
  sendNewsletterAction,
} from "./actions";

type SelectionMode = "latest" | "manual";

export function NewsletterCampaignForm({
  articles,
  defaultTemplate,
  defaultTitle,
  subscriberCount,
  emailConfigured,
}: {
  articles: PanelArticleListItem[];
  defaultTemplate: string;
  defaultTitle: string;
  subscriberCount: number;
  emailConfigured: boolean;
}) {
  const publishedArticles = useMemo(
    () =>
      articles.filter((article) => getArticleStatus(article) === "published"),
    [articles],
  );

  const [title, setTitle] = useState(defaultTitle);
  const [greeting, setGreeting] = useState(DEFAULT_NEWSLETTER_GREETING);
  const [template, setTemplate] = useState(defaultTemplate);
  const [mode, setMode] = useState<SelectionMode>("latest");
  const [latestCount, setLatestCount] = useState(3);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<NewsletterPreview | null>(null);
  const [isPreviewing, startPreview] = useTransition();
  const [isSending, startSending] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const buildInput = () => ({
    title,
    greeting,
    template,
    selection: {
      mode,
      latestCount,
      articleIds: selectedIds,
    },
  });

  const runPreview = () => {
    startPreview(async () => {
      try {
        const result = await previewNewsletterAction(buildInput());
        setPreview(result);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível gerar a pré-visualização.");
      }
    });
  };

  const handleSend = () => {
    if (!preview) {
      toast.error("Gere a pré-visualização antes de enviar.");
      return;
    }
    if (preview.articles.length === 0) {
      toast.error("Selecione ao menos uma postagem.");
      return;
    }

    startSending(async () => {
      const result = await sendNewsletterAction(buildInput());

      if (!result.ok) {
        toast.error(result.error ?? "Falha ao disparar a newsletter.");
        return;
      }

      const details = [
        `${result.sent} enviado(s)`,
        result.failed ? `${result.failed} com falha` : null,
        result.skipped ? `${result.skipped} ignorado(s)` : null,
      ]
        .filter(Boolean)
        .join(", ");

      toast.success(`Newsletter disparada: ${details}.`);
    });
  };

  const toggleArticle = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setPreview(null);
  };

  const handleSaveTemplate = () => {
    startSaving(async () => {
      const result = await saveNewsletterTemplateAction({
        title,
        greeting,
        template,
      });

      if (!result.ok) {
        toast.error(result.error ?? "Falha ao salvar o modelo.");
        return;
      }

      setSavedAt(new Date());
      toast.success("Modelo da newsletter salvo.");
    });
  };

  const selectedCount = mode === "latest" ? latestCount : selectedIds.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <section className="rounded-lg border bg-background p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Conteúdo do e-mail</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Preencha o assunto e edite o modelo abaixo. Os marcadores são
                substituídos automaticamente no envio.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button
                disabled={isSaving || isSending}
                onClick={handleSaveTemplate}
                type="button"
                variant="secondary"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                Salvar modelo
              </Button>
              {savedAt && (
                <span className="text-muted-foreground text-xs">
                  Salvo às{" "}
                  {savedAt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="newsletter-title">Assunto / título</Label>
              <Input
                id="newsletter-title"
                onChange={(event) => {
                  setTitle(event.target.value);
                  setPreview(null);
                }}
                placeholder="Novidades da Kianda Diversidade"
                value={title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newsletter-greeting">Saudação inicial</Label>
              <Input
                id="newsletter-greeting"
                onChange={(event) => {
                  setGreeting(event.target.value);
                  setPreview(null);
                }}
                placeholder={DEFAULT_NEWSLETTER_GREETING}
                value={greeting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newsletter-template">Modelo do e-mail</Label>
              <Textarea
                className="min-h-64 font-mono text-xs md:text-xs"
                id="newsletter-template"
                onChange={(event) => {
                  setTemplate(event.target.value);
                  setPreview(null);
                }}
                value={template}
              />
              <div className="flex flex-wrap gap-1.5">
                {NEWSLETTER_TEMPLATE_PLACEHOLDERS.map((placeholder) => (
                  <Badge
                    className="font-mono"
                    key={placeholder.token}
                    title={placeholder.description}
                    variant="outline"
                  >
                    {placeholder.token}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-5">
          <h2 className="font-semibold">Postagens</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Escolha as postagens publicadas que serão enviadas.
          </p>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label>Forma de seleção</Label>
              <Select
                onValueChange={(value) => {
                  setMode(value as SelectionMode);
                  setPreview(null);
                }}
                value={mode}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">As últimas X postagens</SelectItem>
                  <SelectItem value="manual">
                    Escolher postagens manualmente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "latest" ? (
              <div className="grid gap-2">
                <Label htmlFor="newsletter-latest-count">
                  Quantidade de postagens
                </Label>
                <Input
                  id="newsletter-latest-count"
                  max={20}
                  min={1}
                  onChange={(event) => {
                    setLatestCount(Number(event.target.value) || 1);
                    setPreview(null);
                  }}
                  type="number"
                  value={latestCount}
                />
                <p className="text-muted-foreground text-xs">
                  Serão usadas as {latestCount} postagens publicadas mais
                  recentes.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Postagens publicadas</Label>
                {publishedArticles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma postagem publicada disponível.
                  </p>
                ) : (
                  <ul className="max-h-72 divide-y overflow-y-auto rounded-md border">
                    {publishedArticles.map((article) => (
                      <li
                        className="flex items-start gap-3 p-3"
                        key={article.id}
                      >
                        <Switch
                          checked={selectedIds.includes(article.id)}
                          className="mt-0.5"
                          id={`article-${article.id}`}
                          onCheckedChange={() => toggleArticle(article.id)}
                        />
                        <Label
                          className="flex flex-col items-start gap-0.5 font-normal"
                          htmlFor={`article-${article.id}`}
                        >
                          <span className="font-medium">{article.title}</span>
                          <span className="text-muted-foreground text-xs">
                            {article.author?.name ?? "Sem autor"}
                          </span>
                        </Label>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-muted-foreground text-xs">
                  {selectedIds.length} postagem(ns) selecionada(s).
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border bg-background p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Envio</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {subscriberCount} inscrito(s) confirmado(s) · {selectedCount}{" "}
                postagem(ns) ·{" "}
                {emailConfigured ? (
                  <span className="text-emerald-600">SES configurado</span>
                ) : (
                  <span className="text-destructive">SES não configurado</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={isPreviewing || isSending}
                onClick={runPreview}
                type="button"
                variant="outline"
              >
                {isPreviewing ? <Loader2 className="animate-spin" /> : <Eye />}
                Pré-visualizar
              </Button>
              <LoadingButton
                loading={isSending}
                loadingText="Enviando..."
                onClick={handleSend}
                type="button"
              >
                <Send />
                Disparar newsletter
              </LoadingButton>
            </div>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Pré-visualização</h2>
          {preview && (
            <span className="text-muted-foreground text-xs">
              {preview.recipientCount} destinatário(s)
            </span>
          )}
        </div>
        <div className="flex-1 overflow-hidden rounded-lg border bg-white">
          {preview ? (
            <iframe
              className="h-full min-h-[640px] w-full"
              srcDoc={preview.html}
              title="Pré-visualização da newsletter"
            />
          ) : (
            <div className="text-muted-foreground flex h-full min-h-[640px] items-center justify-center p-6 text-center text-sm">
              Clique em “Pré-visualizar” para ver como o e-mail será exibido.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
