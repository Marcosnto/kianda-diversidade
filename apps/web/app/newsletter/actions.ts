"use server";

import { subscribeToNewsletter } from "@workspace/db/newsletter";
import { sendNewsletterConfirmation } from "@/lib/email";

export type SubscribeResult = {
	ok: boolean;
	error?: string;
};

export async function subscribeAction(email: string): Promise<SubscribeResult> {
	const normalized = String(email ?? "").trim();

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
		return { ok: false, error: "Informe um e-mail válido." };
	}

	try {
		const { token } = await subscribeToNewsletter(normalized);

		if (token) {
			await sendNewsletterConfirmation({ to: normalized, token });
		}

		return { ok: true };
	} catch (error) {
		console.error("Erro ao inscrever na newsletter", error);
		return {
			ok: false,
			error: "Não foi possível concluir a inscrição. Tente novamente.",
		};
	}
}
