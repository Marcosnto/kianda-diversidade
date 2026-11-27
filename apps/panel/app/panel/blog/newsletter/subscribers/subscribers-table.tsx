"use client";

import type { PanelSubscriberListItem } from "@workspace/db/newsletter";
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
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteSubscriberAction } from "./actions";

const PAGE_SIZE = 15;

function formatDate(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function SubscribersTable({
  subscribers,
}: {
  subscribers: PanelSubscriberListItem[];
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<PanelSubscriberListItem | null>(
    null,
  );
  const [isDeleting, startDelete] = useTransition();

  const visible = useMemo(
    () => subscribers.filter((item) => !deletedIds.includes(item.id)),
    [deletedIds, subscribers],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visible;

    return visible.filter((item) => item.email.toLowerCase().includes(q));
  }, [search, visible]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const confirmedCount = visible.filter((item) => item.is_confirmed).length;

  const confirmDelete = () => {
    if (!confirming) return;
    const subscriber = confirming;
    setPendingId(subscriber.id);

    startDelete(async () => {
      const result = await deleteSubscriberAction(subscriber.id);
      setPendingId(null);

      if (!result.ok) {
        toast.error(result.error ?? "Falha ao excluir o inscrito.");
        return;
      }

      setDeletedIds((current) => [...current, subscriber.id]);
      setConfirming(null);
      toast.success(`Inscrito ${subscriber.email} excluído.`);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Input
          className="w-full sm:max-w-sm"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por e-mail..."
          value={search}
        />
        <span className="text-muted-foreground text-sm">
          {filtered.length} de {visible.length} · {confirmedCount} confirmado(s)
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="hidden w-32 sm:table-cell">
                Confirmado em
              </TableHead>
              <TableHead className="hidden w-32 md:table-cell">
                Inscrito em
              </TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-muted-foreground h-24 text-center"
                  colSpan={5}
                >
                  Nenhum inscrito encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="max-w-72 truncate font-medium">
                    {subscriber.email}
                  </TableCell>
                  <TableCell>
                    {subscriber.is_confirmed ? (
                      <Badge variant="success">Confirmado</Badge>
                    ) : (
                      <Badge variant="warning">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {formatDate(subscriber.confirmed_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {formatDate(subscriber.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      aria-label={`Excluir ${subscriber.email}`}
                      disabled={isDeleting || pendingId === subscriber.id}
                      onClick={() => setConfirming(subscriber)}
                      size="icon-sm"
                      title="Excluir inscrito"
                      type="button"
                      variant="ghost"
                    >
                      {pendingId === subscriber.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Trash2 className="text-destructive" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Página {currentPage} de {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            size="sm"
            type="button"
            variant="outline"
          >
            <ChevronLeft />
            Anterior
          </Button>
          <Button
            disabled={currentPage === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            size="sm"
            type="button"
            variant="outline"
          >
            Próxima
            <ChevronRight />
          </Button>
        </div>
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !isDeleting) setConfirming(null);
        }}
        open={confirming !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir inscrito</AlertDialogTitle>
            <AlertDialogDescription>
              O e-mail <strong>{confirming?.email}</strong> será removido da
              newsletter e deixará de receber os disparos. A pessoa poderá se
              inscrever novamente pelo site. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
