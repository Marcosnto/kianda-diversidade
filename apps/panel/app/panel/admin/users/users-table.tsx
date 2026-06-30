"use client";

import type { PanelUserListItem } from "@workspace/db/users";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getAuthProvider(auth0Id: string) {
  const provider = auth0Id.split("|")[0];

  const labels: Record<string, string> = {
    auth0: "E-mail e senha",
    "google-oauth2": "Google",
  };

  return labels[provider ?? ""] ?? provider ?? "Auth0";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function UsersTable({ users }: { users: PanelUserListItem[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const provider = getAuthProvider(user.auth0_id).toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.auth0_id.toLowerCase().includes(q) ||
        provider.includes(q)
      );
    });
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Input
          className="w-full sm:max-w-sm"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nome, e-mail, provedor ou ID..."
          value={search}
        />
        <span className="text-muted-foreground text-sm">
          {filtered.length} de {users.length}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead className="hidden md:table-cell">Provedor</TableHead>
              <TableHead className="hidden lg:table-cell">ID Auth0</TableHead>
              <TableHead className="w-24">Artigos</TableHead>
              <TableHead className="hidden w-36 sm:table-cell">
                Cadastro
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-muted-foreground h-24 text-center"
                  colSpan={5}
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage
                          className="object-cover"
                          src={user.picture ?? undefined}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {getInitials(user.name) || "KD"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="block truncate font-medium">
                          {user.name}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {user.email ?? "E-mail não informado"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">
                      {getAuthProvider(user.auth0_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden max-w-56 truncate font-mono text-xs lg:table-cell">
                    {user.auth0_id}
                  </TableCell>
                  <TableCell>{user._count.articles}</TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {formatDate(user.created_at)}
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
    </div>
  );
}
