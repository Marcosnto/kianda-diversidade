import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArticleForm } from "@/components/article-form";
import { createArticleAction } from "./actions";

export default function CreateArticlePage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Novo artigo
          </h1>
          <p className="text-muted-foreground text-sm">
            Preencha os campos para publicar um novo conteúdo.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/panel/blog/articles">Voltar para a lista</Link>
        </Button>
      </header>

      <ArticleForm
        defaults={{ publishedIn: today }}
        onSubmit={createArticleAction}
        submitLabel="Criar artigo"
        pendingLabel="Criando..."
      />
    </div>
  );
}
