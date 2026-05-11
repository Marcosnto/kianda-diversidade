"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

const MDXEditor = dynamic(
  () => import("@/components/mdx-editor").then((m) => m.default),
  { ssr: false },
);

const CATEGORIAS = [
  { value: "ansiedade", label: "Ansiedade" },
  { value: "depressao", label: "Depressão" },
  { value: "relacionamentos", label: "Relacionamentos" },
  { value: "bem-estar", label: "Bem-estar" },
  { value: "autoconhecimento", label: "Autoconhecimento" },
  { value: "infancia", label: "Infância" },
] as const;

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const articleSchema = z.object({
  Titulo: z
    .string()
    .min(3, "Mínimo de 3 caracteres")
    .max(200, "Máximo de 200 caracteres"),
  Resumo: z
    .string()
    .min(10, "Mínimo de 10 caracteres")
    .max(500, "Máximo de 500 caracteres"),
  Publicacao: z.string().min(1, "Informe a data de publicação"),
  Destaque: z.boolean(),
  Capa: z
    .instanceof(File, { message: "Selecione uma imagem" })
    .refine((f) => f.size <= MAX_COVER_BYTES, "Imagem maior que 5MB")
    .refine(
      (f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
      "Formato não suportado (use JPG, PNG, WEBP ou GIF)",
    )
    .optional(),
  Tags: z.array(z.string().min(1)),
  Categoria: z.string().min(1, "Selecione uma categoria"),
  Conteudo: z.string().min(20, "Conteúdo muito curto"),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;

export type ArticleFormDefaults = Partial<
  Omit<ArticleFormValues, "Capa">
>;

export type ArticleFormSubmitResult = {
  ok: boolean;
  error?: string;
};

export type ArticleFormProps = {
  defaults?: ArticleFormDefaults;
  initialCoverUrl?: string;
  submitLabel: string;
  pendingLabel?: string;
  redirectTo?: string;
  /** Treats Capa as optional (the user keeps the existing cover unless replacing). */
  coverOptional?: boolean;
  onSubmit: (data: FormData) => Promise<ArticleFormSubmitResult>;
};

export function ArticleForm({
  defaults,
  initialCoverUrl,
  submitLabel,
  pendingLabel,
  redirectTo = "/panel/blog/articles",
  coverOptional = false,
  onSubmit,
}: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialCoverUrl ?? null,
  );
  const tagInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      Titulo: defaults?.Titulo ?? "",
      Resumo: defaults?.Resumo ?? "",
      Publicacao:
        defaults?.Publicacao ?? new Date().toISOString().slice(0, 10),
      Destaque: defaults?.Destaque ?? false,
      Tags: defaults?.Tags ?? [],
      Categoria: defaults?.Categoria ?? "",
      Conteudo: defaults?.Conteudo ?? "",
    },
  });

  const tags = form.watch("Tags");

  const addTag = () => {
    const value = tagInputRef.current?.value.trim();
    if (!value) return;
    if (tags.includes(value)) return;
    form.setValue("Tags", [...tags, value], { shouldDirty: true });
    if (tagInputRef.current) tagInputRef.current.value = "";
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "Tags",
      tags.filter((t) => t !== tag),
      { shouldDirty: true },
    );
  };

  const handleSubmit = (values: ArticleFormValues) => {
    if (!coverOptional && !values.Capa) {
      form.setError("Capa", { message: "Selecione uma imagem" });
      return;
    }

    setSubmitError(null);
    const fd = new FormData();
    fd.set("Titulo", values.Titulo);
    fd.set("Resumo", values.Resumo);
    fd.set("Publicacao", values.Publicacao);
    fd.set("Destaque", String(values.Destaque));
    fd.set("Conteudo", values.Conteudo);
    if (values.Capa) fd.set("Capa", values.Capa);

    startTransition(async () => {
      const result = await onSubmit(fd);
      if (!result.ok) {
        setSubmitError(result.error ?? "Falha ao salvar o artigo.");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4 sm:gap-6"
      >
        <FormField
          control={form.control}
          name="Titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Como lidar com a ansiedade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Resumo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resumo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva brevemente o conteúdo do artigo"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Aparece nos cards de listagem do site.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="Publicacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de publicação</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="Capa"
          render={({ field: { onChange, value: _value, ...rest } }) => (
            <FormItem>
              <FormLabel>
                Foto de capa
                {coverOptional && (
                  <span className="text-muted-foreground ml-1 text-xs font-normal">
                    (opcional — mantém a atual se não trocar)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                      setCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                  {...rest}
                />
              </FormControl>
              <FormDescription>JPG, PNG, WEBP ou GIF até 5MB.</FormDescription>
              {coverPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverPreview}
                  alt="Pré-visualização da capa"
                  className="mt-2 max-h-48 rounded-md border object-cover"
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Destaque"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="space-y-0.5">
                <FormLabel>Destaque</FormLabel>
                <FormDescription>
                  Aparece com prioridade na home do site.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  ref={tagInputRef}
                  placeholder="Digite e pressione Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  className="shrink-0 sm:w-auto"
                >
                  Adicionar
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remover ${tag}`}
                        className="hover:bg-foreground/10 ml-0.5 rounded-sm p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Conteudo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "border-input flex min-h-[560px] flex-col overflow-hidden rounded-md border",
                    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                    "[&>div]:flex [&>div]:flex-1 [&>div]:flex-col",
                  )}
                >
                  <MDXEditor
                    markdown={field.value}
                    onChange={(value) => field.onChange(value ?? "")}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <p className="text-destructive text-sm">{submitError}</p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (pendingLabel ?? "Salvando...") : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
