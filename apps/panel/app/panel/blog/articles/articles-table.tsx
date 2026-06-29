"use client";

import {
  type ArticleStatus,
  getArticleStatus,
} from "@workspace/db/article-status";
import type { PanelArticleListItem } from "@workspace/db/articles";
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
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteArticleAction } from "./actions";

const STATUS_LABEL: Record<ArticleStatus, string> = {
  published: "Publicado",
  draft: "Rascunho",
};

const STATUS_VARIANT: Record<ArticleStatus, "success" | "warning"> = {
  published: "success",
  draft: "warning",
};

export function ArticlesTable({
  articles,
}: {
  articles: PanelArticleListItem[];
}) {
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<PanelArticleListItem | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((article) => {
      const status = STATUS_LABEL[getArticleStatus(article)].toLowerCase();
      return (
        article.title.toLowerCase().includes(q) ||
        article.author?.name.toLowerCase().includes(q) ||
        article.id.toLowerCase().includes(q) ||
        status.includes(q)
      );
    });
  }, [articles, search]);

  const confirmDelete = () => {
    if (!confirming) return;
    const article = confirming;
    setPendingId(article.id);
    setDeleteError(null);
    startTransition(async () => {
      const { ok } = await deleteArticleAction(article.id);
      setPendingId(null);
      if (!ok) {
        const message = "Falha ao remover o artigo.";
        setDeleteError(message);
        toast.error(message);
        return;
      }
      toast.success("Artigo removido.");
      setConfirming(null);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Input
          placeholder="Buscar por título, autor, ID ou status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <span className="text-muted-foreground text-sm">
          {filtered.length} de {articles.length}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-20 sm:table-cell">ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Autor</TableHead>
              <TableHead className="w-28 sm:w-32">Status</TableHead>
              <TableHead className="w-24 text-right sm:w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  Nenhum artigo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((article) => {
                const status = getArticleStatus(article);
                const isPending = pendingId === article.id;
                return (
                  <TableRow key={article.id}>
                    <TableCell className="text-muted-foreground hidden font-mono sm:table-cell">
                      {article.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="block max-w-[18ch] truncate sm:max-w-none sm:whitespace-normal">
                        {article.title}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block font-mono text-xs sm:hidden">
                        #{article.id.slice(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {article.author?.name ?? "Sem autor"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[status]}>
                        {STATUS_LABEL[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link
                            href={`/panel/blog/articles/${article.id}/edit`}
                            aria-label="Editar artigo"
                          >
                            <Pencil />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remover artigo"
                          onClick={() => {
                            setDeleteError(null);
                            setConfirming(article);
                          }}
                          disabled={isPending}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
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
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirming(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover artigo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <span className="text-foreground font-medium">
                {confirming?.title}
              </span>
              ? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-destructive text-sm">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingId === confirming?.id}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={pendingId === confirming?.id}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {pendingId === confirming?.id ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
