import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { getArticles } from "@/lib/articles";
import { ArticlesTable } from "./articles-table";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artigos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os artigos publicados e em rascunho.
          </p>
        </div>
        <Button asChild>
          <Link href="/panel/blog/create">Novo artigo</Link>
        </Button>
      </header>

      <ArticlesTable articles={articles} />
    </div>
  );
}
