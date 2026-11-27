import { prisma } from "./prisma";

export type NewsletterSubscriptionResult =
	| { status: "created" }
	| { status: "already_confirmed" }
	| { status: "resent" };

/**
 * Cria (ou reaproveita) a inscrição de um e-mail na newsletter.
 * Retorna o token de confirmação para o envio do e-mail via SES.
 */
export async function subscribeToNewsletter(
	email: string,
): Promise<{ result: NewsletterSubscriptionResult; token: string | null }> {
	const normalizedEmail = email.trim().toLowerCase();

	const existing = await prisma.newsletterSubscriber.findUnique({
		where: { email: normalizedEmail },
	});

	if (existing?.is_confirmed) {
		return { result: { status: "already_confirmed" }, token: null };
	}

	if (existing) {
		const token = crypto.randomUUID();
		await prisma.newsletterSubscriber.update({
			where: { id: existing.id },
			data: { confirmation_token: token },
		});
		return { result: { status: "resent" }, token };
	}

	const token = crypto.randomUUID();
	await prisma.newsletterSubscriber.create({
		data: {
			email: normalizedEmail,
			confirmation_token: token,
		},
	});

	return { result: { status: "created" }, token };
}

/**
 * Confirma a inscrição a partir do token recebido por e-mail.
 * Retorna os dados do inscrito (ou `null` quando o token é inválido).
 */
export async function confirmNewsletterSubscription(token: string) {
	const subscriber = await prisma.newsletterSubscriber.findUnique({
		where: { confirmation_token: token },
	});

	if (!subscriber) return null;

	const unsubscribeToken = subscriber.unsubscribe_token ?? crypto.randomUUID();

	await prisma.newsletterSubscriber.update({
		where: { id: subscriber.id },
		data: {
			is_confirmed: true,
			confirmed_at: new Date(),
			confirmation_token: null,
			unsubscribe_token: unsubscribeToken,
		},
	});

	return { email: subscriber.email, unsubscribeToken };
}

/**
 * Cancela a inscrição a partir do token enviado no rodapé dos e-mails.
 */
export async function unsubscribeFromNewsletter(token: string) {
	const subscriber = await prisma.newsletterSubscriber.findUnique({
		where: { unsubscribe_token: token },
	});

	if (!subscriber) return false;

	await prisma.newsletterSubscriber.delete({ where: { id: subscriber.id } });

	return true;
}

export async function listConfirmedSubscribers() {
	return prisma.newsletterSubscriber.findMany({
		where: { is_confirmed: true },
		orderBy: { confirmed_at: "desc" },
		select: { id: true, email: true, confirmed_at: true },
	});
}

export type PanelSubscriberListItem = Awaited<
	ReturnType<typeof listAllSubscribers>
>[number];

/**
 * Lista todos os inscritos (confirmados ou não) para a tela do painel.
 */
export async function listAllSubscribers() {
	return prisma.newsletterSubscriber.findMany({
		orderBy: [{ confirmed_at: "desc" }, { created_at: "desc" }],
		select: {
			id: true,
			email: true,
			is_confirmed: true,
			confirmed_at: true,
			created_at: true,
		},
	});
}

export async function deleteSubscriber(id: string) {
	await prisma.newsletterSubscriber.delete({ where: { id } });
}

export async function listConfirmedSubscriberEmails() {
	const subscribers = await prisma.newsletterSubscriber.findMany({
		where: { is_confirmed: true },
		orderBy: { confirmed_at: "desc" },
		select: { email: true },
	});

	return subscribers.map((subscriber) => subscriber.email);
}

export type NewsletterRecipient = {
	email: string;
	unsubscribeToken: string | null;
};

/**
 * Lista os inscritos confirmados junto com o token de descadastro, para que
 * cada e-mail enviado tenha um link de cancelamento próprio.
 */
export async function listNewsletterRecipients(): Promise<
	NewsletterRecipient[]
> {
	const subscribers = await prisma.newsletterSubscriber.findMany({
		where: { is_confirmed: true },
		orderBy: { confirmed_at: "desc" },
		select: { id: true, email: true, unsubscribe_token: true },
	});

	const missingToken = subscribers.filter(
		(subscriber) => !subscriber.unsubscribe_token,
	);

	if (missingToken.length > 0) {
		await Promise.all(
			missingToken.map((subscriber) =>
				prisma.newsletterSubscriber.update({
					where: { id: subscriber.id },
					data: { unsubscribe_token: crypto.randomUUID() },
				}),
			),
		);
	}

	return subscribers.map((subscriber) => ({
		email: subscriber.email,
		unsubscribeToken: subscriber.unsubscribe_token ?? null,
	}));
}

export async function countConfirmedSubscribers() {
	return prisma.newsletterSubscriber.count({ where: { is_confirmed: true } });
}
