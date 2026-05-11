import { getArticles } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArticlesTable } from "./articles-table";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getArticles({ includeDrafts: true });

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

      {articles === null ? (
        <div className="text-destructive rounded-md border p-4 text-sm">
          Falha ao carregar artigos. Verifique <code>API_BASE_URL</code> e{" "}
          <code>API_TOKEN</code>.
        </div>
      ) : (
        <ArticlesTable articles={articles} />
      )}
    </div>
  );
}
