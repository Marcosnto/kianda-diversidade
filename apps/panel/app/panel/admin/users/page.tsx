import { getUsers } from "@workspace/db/users";
import { PERMISSIONS } from "@/lib/authorization";
import { requirePagePermission } from "@/lib/page-authorization";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requirePagePermission(PERMISSIONS.readUsers);
  const users = await getUsers();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground text-sm">
          Consulte os usuários cadastrados no painel. Em breve, esta área também
          será usada para gerenciar permissões.
        </p>
      </header>

      <UsersTable users={users} />
    </div>
  );
}
