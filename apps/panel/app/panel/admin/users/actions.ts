"use server";

import { revalidatePath } from "next/cache";
import { isManagedRoleName, setUserManagedRole } from "@/lib/auth0-management";
import { PERMISSIONS, requirePermission } from "@/lib/authorization";

export type UpdateUserRoleResult = {
  ok: boolean;
  role?: string | null;
  error?: string;
};

export async function updateUserRoleAction(
  auth0Id: string,
  role: string,
): Promise<UpdateUserRoleResult> {
  try {
    const authorization = await requirePermission(PERMISSIONS.manageUsers);
    const currentAuth0Id = authorization.session.user.sub;

    if (auth0Id === currentAuth0Id) {
      return {
        ok: false,
        error: "Você não pode alterar a própria role.",
      };
    }

    const selectedRole = role === "none" ? null : role.toLowerCase();
    if (selectedRole !== null && !isManagedRoleName(selectedRole)) {
      return { ok: false, error: "Role inválida." };
    }

    await setUserManagedRole(auth0Id, selectedRole);
    revalidatePath("/panel/admin/users");

    return { ok: true, role: selectedRole };
  } catch (error) {
    console.error("Erro ao atualizar role do usuário", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a role.",
    };
  }
}
