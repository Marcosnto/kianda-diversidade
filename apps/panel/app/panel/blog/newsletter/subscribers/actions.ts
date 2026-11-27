"use server";

import { deleteSubscriber } from "@workspace/db/newsletter";
import { revalidatePath } from "next/cache";
import { PERMISSIONS, requirePermission } from "@/lib/authorization";

export type DeleteSubscriberResult = {
  ok: boolean;
  error?: string;
};

export async function deleteSubscriberAction(
  id: string,
): Promise<DeleteSubscriberResult> {
  try {
    await requirePermission(PERMISSIONS.manageSite);

    if (!id) {
      return { ok: false, error: "Inscrito inválido." };
    }

    await deleteSubscriber(id);
  } catch (error) {
    console.error("Erro ao excluir inscrito da newsletter", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o inscrito.",
    };
  }

  revalidatePath("/panel/blog/newsletter/subscribers");
  revalidatePath("/panel/blog/newsletter");
  return { ok: true };
}
