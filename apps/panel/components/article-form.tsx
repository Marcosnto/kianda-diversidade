"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const MDXEditor = dynamic(
  () => import("@/components/mdx-editor").then((m) => m.default),
  { ssr: false },
);

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const articleSchema = z.object({
  title: z
    .string()
    .min(3, "Mínimo de 3 caracteres")
    .max(200, "Máximo de 200 caracteres"),
  summary: z
    .string()
    .min(10, "Mínimo de 10 caracteres")
    .max(500, "Máximo de 500 caracteres"),
  publishedIn: z.string().min(1, "Informe a data de publicação"),
  isHighlight: z.boolean(),
  coverImage: z
    .instanceof(File, { message: "Selecione uma imagem" })
    .refine((f) => f.size <= MAX_COVER_BYTES, "Imagem maior que 5MB")
    .refine(
      (f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
      "Formato não suportado (use JPG, PNG, WEBP ou GIF)",
    )
    .optional(),
  tags: z.array(z.string().min(1)),
  categories: z
    .array(z.string().min(1))
    .min(1, "Selecione ao menos uma categoria"),
  content: z.string().min(20, "Conteúdo muito curto"),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;

export type ArticleFormDefaults = Partial<
  Omit<ArticleFormValues, "coverImage">
>;

export type ArticleFormSubmitResult = {
  ok: boolean;
  error?: string;
};

export type ArticleFormProps = {
  defaults?: ArticleFormDefaults;
  categoryOptions: { value: string; label: string }[];
  initialCoverUrl?: string;
  submitLabel: string;
  pendingLabel?: string;
  redirectTo?: string;
  coverOptional?: boolean;
  onSubmit: (data: FormData) => Promise<ArticleFormSubmitResult>;
};

export function ArticleForm({
  defaults,
  categoryOptions,
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
  const [isUploadingContentImage, setIsUploadingContentImage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const contentImageUrlsRef = useRef(
    extractContentImageUrls(defaults?.content ?? ""),
  );
  const tagInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: defaults?.title ?? "",
      summary: defaults?.summary ?? "",
      publishedIn:
        defaults?.publishedIn ?? new Date().toISOString().slice(0, 10),
      isHighlight: defaults?.isHighlight ?? false,
      tags: defaults?.tags ?? [],
      categories: defaults?.categories ?? [],
      content: defaults?.content ?? "",
    },
  });

  const tags = form.watch("tags");
  const categories = form.watch("categories");

  const addCategory = (category: string) => {
    if (!category || categories.includes(category)) return;
    form.setValue("categories", [...categories, category], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeCategory = (category: string) => {
    form.setValue(
      "categories",
      categories.filter((c) => c !== category),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const addTag = () => {
    const value = tagInputRef.current?.value.trim();
    if (!value) return;
    if (tags.includes(value)) return;
    form.setValue("tags", [...tags, value], { shouldDirty: true });
    if (tagInputRef.current) tagInputRef.current.value = "";
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      tags.filter((t) => t !== tag),
      { shouldDirty: true },
    );
  };

  const handleContentChange = (value: string) => {
    const nextValue = value ?? "";
    const previousUrls = contentImageUrlsRef.current;
    const nextUrls = extractContentImageUrls(nextValue);
    const removedUrls = previousUrls.filter((url) => !nextUrls.includes(url));

    contentImageUrlsRef.current = nextUrls;
    form.setValue("content", nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });

    for (const url of removedUrls) {
      toast.promise(deleteContentImage(url), {
        loading: "Removendo imagem...",
        success: "Imagem removida do ImageKit.",
        error: "Falha ao remover imagem do ImageKit.",
      });
    }
  };

  const handleSubmit = (values: ArticleFormValues) => {
    if (!coverOptional && !values.coverImage) {
      form.setError("coverImage", { message: "Selecione uma imagem" });
      return;
    }
    if (isUploadingContentImage) {
      toast.warning("Aguarde o upload da imagem do conteúdo terminar.");
      return;
    }

    setSubmitError(null);
    const fd = new FormData();
    fd.set("title", values.title);
    fd.set("summary", values.summary);
    fd.set("published_in", values.publishedIn);
    fd.set("is_highlight", String(values.isHighlight));
    fd.set("content", values.content);
    fd.set("tags", JSON.stringify(values.tags));
    fd.set("categories", JSON.stringify(values.categories));
    if (values.coverImage) fd.set("cover_image", values.coverImage);

    startTransition(async () => {
      const result = await onSubmit(fd);
      if (!result.ok) {
        const message = result.error ?? "Falha ao salvar o artigo.";
        setSubmitError(message);
        toast.error(message);
        return;
      }
      toast.success(coverOptional ? "Artigo atualizado." : "Artigo criado.");
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
          name="title"
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
          name="summary"
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
            name="publishedIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de publicação</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <div className="min-h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categories"
            render={() => (
              <FormItem>
                <FormLabel>Categorias</FormLabel>
                <Select
                  value={selectedCategory || undefined}
                  onValueChange={(value) => {
                    addCategory(value);
                    setSelectedCategory("");
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        disabled={categories.includes(category.value)}
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="min-h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 md:col-span-2">
              {categories.map((category) => {
                const label =
                  categoryOptions.find((option) => option.value === category)
                    ?.label ?? category;

                return (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="h-7 gap-1 pr-1"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      aria-label={`Remover ${label}`}
                      className="hover:bg-foreground/10 ml-0.5 rounded-sm p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="coverImage"
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
          name="isHighlight"
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
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>tags</FormLabel>
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
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "border-input flex min-h-140 flex-col overflow-hidden rounded-md border",
                    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                    "[&>div]:flex [&>div]:flex-1 [&>div]:flex-col",
                  )}
                >
                  <MDXEditor
                    markdown={field.value}
                    onChange={handleContentChange}
                    onImageUploadChange={setIsUploadingContentImage}
                  />
                </div>
              </FormControl>
              {isUploadingContentImage && (
                <p className="text-muted-foreground text-sm">
                  Subindo imagem do conteúdo...
                </p>
              )}
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
            disabled={isPending || isUploadingContentImage}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || isUploadingContentImage}>
            {isUploadingContentImage
              ? "Subindo imagem..."
              : isPending
                ? (pendingLabel ?? "Salvando...")
                : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function extractContentImageUrls(content: string) {
  const urls = new Set<string>();
  const imageKitContentUrl =
    /https:\/\/ik\.imagekit\.io\/kiandadiversidade\/articles\/content\/[^"'\s>)]+/g;

  for (const match of content.matchAll(imageKitContentUrl)) {
    urls.add(match[0]);
  }

  return Array.from(urls);
}

async function deleteContentImage(url: string) {
  const response = await fetch("/api/upload/content-image", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Falha ao remover imagem do conteúdo");
  }
}
