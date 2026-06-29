"use server";

import { getCurrentDatabaseUser } from "@/lib/current-user";
import { updateContactChannels } from "@workspace/db/contact-channels";
import { revalidatePath } from "next/cache";

export type UpdateContactChannelsResult = {
  ok: boolean;
  error?: string;
};

const SOCIAL_FIELDS = [
  "youtube",
  "linkedin",
  "instagram",
  "threads",
  "facebook",
  "whatsapp",
  "tiktok",
  "x",
] as const;

function parseUrl(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const url = new URL(text);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Protocolo inválido.");
  }

  return url.toString();
}

export async function updateContactChannelsAction(
  formData: FormData,
): Promise<UpdateContactChannelsResult> {
  try {
    await getCurrentDatabaseUser();

    const values = Object.fromEntries(
      SOCIAL_FIELDS.map((field) => [field, parseUrl(formData.get(field))]),
    );

    await updateContactChannels(values);
  } catch (error) {
    console.error("Erro ao atualizar canais de contato", error);
    return {
      ok: false,
      error: "Verifique os links informados e tente novamente.",
    };
  }

  revalidatePath("/panel/blog/general-information/contact-channels");
  revalidatePath("/", "layout");

  return { ok: true };
}
