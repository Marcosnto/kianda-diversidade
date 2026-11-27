"use server";

import { deleteUser, getUserById } from "@workspace/db/users";
import { revalidatePath } from "next/cache";
import {
  deleteManagedUser,
  isManagedRoleName,
  setUserManagedRole,
} from "@/lib/auth0-management";
import { PERMISSIONS, requirePermission } from "@/lib/authorization";

export type UpdateUserRoleResult = {
  ok: boolean;
  role?: string | null;
  error?: string;
};

export type DeleteUserResult = {
  ok: boolean;
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

/**
 * Exclui o usuário do banco e do Auth0.
 * A conta do próprio usuário logado não pode ser removida por aqui.
 */
export async function deleteUserAction(
  userId: string,
): Promise<DeleteUserResult> {
  try {
    const authorization = await requirePermission(PERMISSIONS.manageUsers);
    const currentAuth0Id = authorization.session.user.sub;

    const user = await getUserById(userId);
    if (!user) {
      return { ok: false, error: "Usuário não encontrado." };
    }

    if (user.auth0_id === currentAuth0Id) {
      return { ok: false, error: "Você não pode excluir a própria conta." };
    }

    // Remove primeiro do Auth0: se falhar, o registro local permanece e a
    // operação pode ser repetida sem deixar um usuário órfão no Auth0.
    await deleteManagedUser(user.auth0_id);

    try {
      await deleteUser(user.id);
    } catch (error) {
      console.error("Erro ao excluir usuário do banco", error);
      return {
        ok: false,
        error:
          "O usuário foi removido do Auth0, mas não do banco de dados. Tente novamente.",
      };
    }

    revalidatePath("/panel/admin/users");
    return { ok: true };
  } catch (error) {
    console.error("Erro ao excluir usuário", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o usuário.",
    };
  }
}
