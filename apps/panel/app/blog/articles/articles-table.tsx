"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import {
  type Article,
  type ArticleStatus,
  getArticleStatus,
} from "@workspace/api";
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
import { deleteArticleAction } from "./actions";

const STATUS_LABEL: Record<ArticleStatus, string> = {
  published: "Publicado",
  draft: "Rascunho",
};

const STATUS_VARIANT: Record<ArticleStatus, "success" | "warning"> = {
  published: "success",
  draft: "warning",
};

export function ArticlesTable({ articles }: { articles: Article[] }) {
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((article) => {
      const status = STATUS_LABEL[getArticleStatus(article)].toLowerCase();
      console.log(getArticleStatus(article));
      return (
        article.Titulo.toLowerCase().includes(q) ||
        String(article.id).includes(q) ||
        status.includes(q)
      );
    });
  }, [articles, search]);

  const handleDelete = (article: Article) => {
    const confirmed = window.confirm(
      `Remover o artigo "${article.Titulo}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmed) return;
    setPendingId(article.documentId);
    startTransition(async () => {
      const { ok } = await deleteArticleAction(article.documentId);
      setPendingId(null);
      if (!ok) window.alert("Falha ao remover o artigo.");
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Input
          placeholder="Buscar por título, ID ou status..."
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
              <TableHead className="w-28 sm:w-32">Status</TableHead>
              <TableHead className="w-24 text-right sm:w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-24 text-center"
                >
                  Nenhum artigo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((article) => {
                const status = getArticleStatus(article);
                const isPending = pendingId === article.documentId;
                return (
                  <TableRow key={article.documentId}>
                    <TableCell className="text-muted-foreground hidden font-mono sm:table-cell">
                      {article.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="block max-w-[18ch] truncate sm:max-w-none sm:whitespace-normal">
                        {article.Titulo}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block font-mono text-xs sm:hidden">
                        #{article.id}
                      </span>
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
                            href={`/blog/articles/${article.documentId}/edit`}
                            aria-label="Editar artigo"
                          >
                            <Pencil />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remover artigo"
                          onClick={() => handleDelete(article)}
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
    </div>
  );
}
