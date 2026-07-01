import { getUsers } from "@workspace/db/users";
import {
  getManagedRoleAssignments,
  getManagedRoles,
} from "@/lib/auth0-management";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { requirePagePermission } from "@/lib/page-authorization";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const authorization = await requirePagePermission(PERMISSIONS.readUsers);
  const users = await getUsers();
  const canManageRoles = hasPermission(authorization, PERMISSIONS.manageUsers);
  let roles: Awaited<ReturnType<typeof getManagedRoles>> = [];
  let roleAssignments: Record<string, string[]> = {};
  let roleManagementError: string | null = null;

  try {
    [roles, roleAssignments] = await Promise.all([
      getManagedRoles(),
      getManagedRoleAssignments(users.map((user) => user.auth0_id)),
    ]);
  } catch (error) {
    console.error("Erro ao carregar roles do Auth0", error);
    roleManagementError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar as roles do Auth0.";
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground text-sm">
          Consulte os usuários cadastrados e gerencie seus perfis de acesso.
        </p>
      </header>

      {roleManagementError && (
        <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm">
          {roleManagementError}
        </div>
      )}

      <UsersTable
        users={users}
        roles={roles}
        initialRoleAssignments={roleAssignments}
        canManageRoles={canManageRoles && !roleManagementError}
        currentAuth0Id={authorization.session.user.sub}
      />
    </div>
  );
}
