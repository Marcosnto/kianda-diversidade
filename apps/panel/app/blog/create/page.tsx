import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArticleForm } from "./article-form";

export default function CreateArticlePage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo artigo</h1>
          <p className="text-muted-foreground text-sm">
            Preencha os campos para publicar um novo conteúdo.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/blog/articles">Voltar para a lista</Link>
        </Button>
      </header>

      <ArticleForm />
    </div>
  );
}
