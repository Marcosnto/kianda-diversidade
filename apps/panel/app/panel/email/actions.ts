"use server";

import {
  EMAIL_TEMPLATE_KEYS,
  upsertEmailTemplate,
} from "@workspace/db/email-templates";
import { revalidatePath } from "next/cache";
import { PERMISSIONS, requirePermission } from "@/lib/authorization";

export type SaveEmailTemplateResult = {
  ok: boolean;
  error?: string;
};

export async function saveWelcomeTemplateAction(
  formData: FormData,
): Promise<SaveEmailTemplateResult> {
  try {
    await requirePermission(PERMISSIONS.manageSite);
  } catch {
    return { ok: false, error: "Você não tem permissão para essa ação." };
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!subject) {
    return { ok: false, error: "Informe o assunto do e-mail." };
  }

  if (body.length < 20) {
    return { ok: false, error: "O conteúdo do e-mail está muito curto." };
  }

  try {
    await upsertEmailTemplate({
      key: EMAIL_TEMPLATE_KEYS.welcome,
      subject,
      body,
    });
  } catch (error) {
    console.error("Erro ao salvar o modelo de e-mail", error);
    return { ok: false, error: "Não foi possível salvar o modelo." };
  }

  revalidatePath("/panel/email");
  return { ok: true };
}
