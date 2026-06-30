import { getArticles, getArticlesByAuthorId } from "@workspace/db/articles";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import {
  hasAnyPermission,
  hasPermission,
  PERMISSIONS,
} from "@/lib/authorization";
import { getCurrentDatabaseUser } from "@/lib/current-user";
import { requirePagePermission } from "@/lib/page-authorization";
import { ArticlesTable } from "./articles-table";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const authorization = await requirePagePermission(
    PERMISSIONS.readOwnArticles,
    PERMISSIONS.readAnyArticles,
  );
  const canReadAny = hasPermission(authorization, PERMISSIONS.readAnyArticles);
  const user = await getCurrentDatabaseUser();
  const articles = canReadAny
    ? await getArticles()
    : await getArticlesByAuthorId(user.id);
  const canCreate = hasPermission(authorization, PERMISSIONS.createArticles);
  const canUpdate = hasAnyPermission(authorization, [
    PERMISSIONS.updateOwnArticles,
    PERMISSIONS.updateAnyArticles,
  ]);
  const canDelete = hasAnyPermission(authorization, [
    PERMISSIONS.deleteOwnArticles,
    PERMISSIONS.deleteAnyArticles,
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artigos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os artigos publicados e em rascunho.
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/panel/blog/create">Novo artigo</Link>
          </Button>
        )}
      </header>

      <ArticlesTable
        articles={articles}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
