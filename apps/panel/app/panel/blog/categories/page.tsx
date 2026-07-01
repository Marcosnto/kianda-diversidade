import { getCategories } from "@workspace/db/categories";
import { PERMISSIONS } from "@/lib/authorization";
import { requirePagePermission } from "@/lib/page-authorization";
import { CategoriesManager } from "./categories-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requirePagePermission(PERMISSIONS.manageSite);
  const categories = await getCategories();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie as categorias disponíveis no cadastro dos artigos.
        </p>
      </header>

      <CategoriesManager categories={categories} />
    </div>
  );
}
