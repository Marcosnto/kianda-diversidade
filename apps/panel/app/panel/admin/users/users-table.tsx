"use client";

import type { PanelUserListItem } from "@workspace/db/users";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { ChevronLeft, ChevronRight, Loader2, Save, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteUserAction, updateUserRoleAction } from "./actions";

const PAGE_SIZE = 8;

type RoleOption = {
  id: string;
  name: string;
  description?: string;
};

type UsersTableProps = {
  users: PanelUserListItem[];
  roles: RoleOption[];
  initialRoleAssignments: Record<string, string[]>;
  canManageRoles: boolean;
  canDeleteUsers: boolean;
  currentAuth0Id: string;
};

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrador",
  author: "Autor",
  patient: "Paciente",
};

function getRoleLabel(role: string) {
  return ROLE_LABELS[role.toLowerCase()] ?? role;
}

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

export function UsersTable({
  users,
  roles,
  initialRoleAssignments,
  canManageRoles,
  canDeleteUsers,
  currentAuth0Id,
}: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleAssignments, setRoleAssignments] = useState(
    initialRoleAssignments,
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmingUser, setConfirmingUser] =
    useState<PanelUserListItem | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const visibleUsers = useMemo(
    () => users.filter((user) => !deletedIds.includes(user.id)),
    [deletedIds, users],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visibleUsers;

    return visibleUsers.filter((user) => {
      const provider = getAuthProvider(user.auth0_id).toLowerCase();
      const assignedRoles = roleAssignments[user.auth0_id] ?? [];
      return (
        user.name.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.auth0_id.toLowerCase().includes(q) ||
        provider.includes(q) ||
        assignedRoles.some((role) =>
          getRoleLabel(role).toLowerCase().includes(q),
        )
      );
    });
  }, [roleAssignments, visibleUsers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const confirmDelete = () => {
    if (!confirmingUser) return;
    const user = confirmingUser;
    setPendingDeleteId(user.id);

    startDelete(async () => {
      const result = await deleteUserAction(user.id);
      setPendingDeleteId(null);

      if (!result.ok) {
        toast.error(result.error ?? "Falha ao excluir o usuário.");
        return;
      }

      setDeletedIds((current) => [...current, user.id]);
      setConfirmingUser(null);
      toast.success(`Usuário ${user.name} excluído.`);
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
          placeholder="Buscar por nome, e-mail, role, provedor ou ID..."
          value={search}
        />
        <span className="text-muted-foreground text-sm">
          {filtered.length} de {visibleUsers.length}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead className="hidden md:table-cell">Provedor</TableHead>
              <TableHead className="min-w-52">Perfil</TableHead>
              <TableHead className="hidden xl:table-cell">ID Auth0</TableHead>
              <TableHead className="w-20">Artigos</TableHead>
              <TableHead className="hidden w-28 lg:table-cell">
                Cadastro
              </TableHead>
              {canDeleteUsers && (
                <TableHead className="w-16 text-right">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-muted-foreground h-24 text-center"
                  colSpan={canDeleteUsers ? 7 : 6}
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
                        <span className="block max-w-56 truncate font-medium">
                          {user.name}
                        </span>
                        <span className="text-muted-foreground block max-w-56 truncate text-xs">
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
                  <TableCell>
                    <UserRoleControl
                      auth0Id={user.auth0_id}
                      assignedRoles={roleAssignments[user.auth0_id] ?? []}
                      roles={roles}
                      canManage={
                        canManageRoles && user.auth0_id !== currentAuth0Id
                      }
                      isCurrentUser={user.auth0_id === currentAuth0Id}
                      onUpdated={(role) =>
                        setRoleAssignments((current) => ({
                          ...current,
                          [user.auth0_id]: role ? [role] : [],
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden max-w-56 truncate font-mono text-xs xl:table-cell">
                    {user.auth0_id}
                  </TableCell>
                  <TableCell>{user._count.articles}</TableCell>
                  <TableCell className="text-muted-foreground hidden lg:table-cell">
                    {formatDate(user.created_at)}
                  </TableCell>
                  {canDeleteUsers && (
                    <TableCell className="text-right">
                      <Button
                        aria-label={`Excluir ${user.name}`}
                        disabled={
                          isDeleting ||
                          user.auth0_id === currentAuth0Id ||
                          pendingDeleteId === user.id
                        }
                        onClick={() => setConfirmingUser(user)}
                        size="icon-sm"
                        title={
                          user.auth0_id === currentAuth0Id
                            ? "Você não pode excluir a própria conta"
                            : "Excluir usuário"
                        }
                        type="button"
                        variant="ghost"
                      >
                        {pendingDeleteId === user.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Trash2 className="text-destructive" />
                        )}
                      </Button>
                    </TableCell>
                  )}
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
          if (!open && !isDeleting) setConfirmingUser(null);
        }}
        open={confirmingUser !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente{" "}
              <strong>{confirmingUser?.name}</strong>
              {confirmingUser?.email ? ` (${confirmingUser.email})` : ""} do
              painel e do Auth0. Os artigos publicados permanecem no site, mas
              ficarão sem autor. Não é possível desfazer.
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

function UserRoleControl({
  auth0Id,
  assignedRoles,
  roles,
  canManage,
  isCurrentUser,
  onUpdated,
}: {
  auth0Id: string;
  assignedRoles: string[];
  roles: RoleOption[];
  canManage: boolean;
  isCurrentUser: boolean;
  onUpdated: (role: string | null) => void;
}) {
  const initialRole = assignedRoles[0]?.toLowerCase() ?? "none";
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [savedRole, setSavedRole] = useState(initialRole);
  const [isPending, startTransition] = useTransition();

  if (!canManage) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {assignedRoles.length > 0 ? (
          assignedRoles.map((role) => (
            <Badge key={role} variant="secondary">
              {getRoleLabel(role)}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">Sem perfil</span>
        )}
        {isCurrentUser && (
          <span className="text-muted-foreground text-xs">Sua conta</span>
        )}
      </div>
    );
  }

  const saveRole = () => {
    startTransition(async () => {
      const result = await updateUserRoleAction(auth0Id, selectedRole);

      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível atualizar o perfil.");
        return;
      }

      setSavedRole(selectedRole);
      onUpdated(result.role ?? null);
      toast.success("Perfil de acesso atualizado.");
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        disabled={isPending}
        onValueChange={setSelectedRole}
        value={selectedRole}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem perfil</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.name.toLowerCase()}>
              {getRoleLabel(role.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        aria-busy={isPending || undefined}
        aria-label="Salvar perfil de acesso"
        className={isPending ? "cursor-progress" : undefined}
        disabled={isPending || selectedRole === savedRole}
        onClick={saveRole}
        size="icon-sm"
        type="button"
      >
        {isPending ? <Loader2 className="animate-spin" /> : <Save />}
      </Button>
    </div>
  );
}
