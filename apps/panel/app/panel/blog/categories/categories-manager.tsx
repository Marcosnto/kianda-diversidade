"use client";

import type { PanelCategoryListItem } from "@workspace/db/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "./actions";

export function CategoriesManager({
  categories,
}: {
  categories: PanelCategoryListItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleting, setDeleting] = useState<PanelCategoryListItem | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categories, search]);

  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await createCategoryAction(newName);
      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível criar a categoria.");
        return;
      }

      setNewName("");
      toast.success("Categoria criada.");
      router.refresh();
    });
  };

  const saveEdit = () => {
    if (editingId === null) return;

    startTransition(async () => {
      const result = await updateCategoryAction(editingId, editingName);
      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível editar a categoria.");
        return;
      }

      setEditingId(null);
      setEditingName("");
      toast.success("Categoria atualizada.");
      router.refresh();
    });
  };

  const remove = () => {
    if (!deleting) return;

    startTransition(async () => {
      const result = await deleteCategoryAction(deleting.id);
      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível remover a categoria.");
        return;
      }

      setDeleting(null);
      toast.success("Categoria removida.");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={create}
      >
        <label
          className="flex flex-1 flex-col gap-2 text-sm font-medium"
          htmlFor="new-category-name"
        >
          Nova categoria
          <Input
            disabled={isPending}
            id="new-category-name"
            maxLength={80}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Ex.: Saúde mental"
            value={newName}
          />
        </label>
        <Button
          className="w-full sm:w-auto"
          disabled={isPending || newName.trim().length < 2}
          type="submit"
        >
          <Plus />
          Adicionar
        </Button>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="w-full sm:max-w-sm"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar categoria..."
          value={search}
        />
        <span className="text-muted-foreground text-sm">
          {filtered.length} de {categories.length}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="w-28">Artigos</TableHead>
              <TableHead className="w-28 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-muted-foreground h-24 text-center"
                  colSpan={3}
                >
                  Nenhuma categoria encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((category) => {
                const isEditing = editingId === category.id;

                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          autoFocus
                          className="max-w-md"
                          disabled={isPending}
                          maxLength={80}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") saveEdit();
                            if (event.key === "Escape") setEditingId(null);
                          }}
                          value={editingName}
                        />
                      ) : (
                        <span className="font-medium">{category.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {category._count.articles}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              aria-label="Salvar categoria"
                              disabled={
                                isPending || editingName.trim().length < 2
                              }
                              onClick={saveEdit}
                              size="icon-sm"
                              type="button"
                            >
                              <Check />
                            </Button>
                            <Button
                              aria-label="Cancelar edição"
                              disabled={isPending}
                              onClick={() => setEditingId(null)}
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            >
                              <X />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              aria-label="Editar categoria"
                              disabled={isPending}
                              onClick={() => {
                                setEditingId(category.id);
                                setEditingName(category.name);
                              }}
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            >
                              <Pencil />
                            </Button>
                            <Button
                              aria-label="Remover categoria"
                              disabled={isPending}
                              onClick={() => setDeleting(category)}
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria <strong>{deleting?.name}</strong> será removida de{" "}
              {deleting?._count.articles ?? 0} artigo(s). Os artigos não serão
              excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                remove();
              }}
            >
              {isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
