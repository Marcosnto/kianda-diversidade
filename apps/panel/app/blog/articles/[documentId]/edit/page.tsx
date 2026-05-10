import { getArticleById } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/article-form";
import { updateArticleAction } from "./actions";
import { NotFound } from "@/components/not-found";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const article = await getArticleById(documentId);

  if (!article) return <NotFound />;

  const action = updateArticleAction.bind(null, documentId);

  const coverUrl = article.Capa?.url
    ? article.Capa.url.startsWith("http")
      ? article.Capa.url
      : `${process.env.API_BASE_URL}${article.Capa.url}`
    : undefined;

  const publicacao = article.Publicacao
    ? article.Publicacao.slice(0, 10)
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
          <Link href="/blog/articles">Voltar para a lista</Link>
        </Button>
      </header>

      <ArticleForm
        defaults={{
          Titulo: article.Titulo,
          Resumo: article.Resumo,
          Publicacao: publicacao,
          Destaque: article.Destaque,
          Conteudo: article.Conteudo,
          Tags: [],
          Categoria: "",
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
