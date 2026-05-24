import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArticleForm } from "@/components/article-form";
import { NotFound } from "@/components/not-found";
import { getArticleById } from "@/lib/articles";
import { updateArticleAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) return <NotFound />;

  const action = updateArticleAction.bind(null, id);

  const coverUrl = article.cover_image?.url;

  const publicacao = article.published_in
    ? article.published_in.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Editar artigo
          </h1>
          <p className="text-muted-foreground text-sm">
            Atualize os campos e salve as alterações.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/panel/blog/articles">Voltar para a lista</Link>
        </Button>
      </header>

      <ArticleForm
        defaults={{
          title: article.title,
          summary: article.summary,
          publishedIn: publicacao,
          isHighlight: article.is_highlight,
          content: article.content,
          tags: article.tags.map((tag) => tag.name),
          categories: article.categories.map((category) => category.name),
        }}
        initialCoverUrl={coverUrl}
        coverOptional
        onSubmit={action}
        submitLabel="Salvar alterações"
        pendingLabel="Salvando..."
      />
    </div>
  );
}
