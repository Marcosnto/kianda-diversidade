import { prisma } from "./prisma";

export const EMAIL_TEMPLATE_KEYS = {
	welcome: "welcome",
	newsletter: "newsletter",
} as const;

export type EmailTemplateKey =
	(typeof EMAIL_TEMPLATE_KEYS)[keyof typeof EMAIL_TEMPLATE_KEYS];

export type EmailTemplate = {
	id: string;
	key: string;
	subject: string;
	body: string;
	updated_at: Date;
};

/**
 * Modelo padrão do e-mail de boas-vindas.
 * Os marcadores `{{...}}` são substituídos no momento do envio.
 */
export const DEFAULT_WELCOME_SUBJECT = "Bem vindo à Newsletter do Kianda Diversidade!";

export const DEFAULT_WELCOME_BODY = [
	"Oi!",
	"",
	"Que bom ter você por aqui. Sua inscrição na newsletter da Kianda Diversidade está confirmada.",
	"",
	"A partir de agora você vai receber nossos conteúdos sobre diversidade, saúde mental e bem-estar, sempre que tivermos novidades.",
	"",
	"Se quiser conhecer o que já publicamos, é só acessar:",
	"{{site}}",
	"",
	"Qualquer dúvida, é só responder este e-mail.",
	"",
	"Um abraço,",
	"Equipe Kianda Diversidade",
	"",
	"Você recebe este e-mail porque se inscreveu na newsletter da Kianda Diversidade.",
	"Para cancelar a inscrição, acesse: {{descadastro}}",
	"© {{ano}} Kianda Diversidade",
].join("\n");

/**
 * Modelo padrão do disparo da newsletter.
 * Os marcadores `{{...}}` são substituídos no momento do envio.
 */
export const DEFAULT_NEWSLETTER_SUBJECT = "Novidades da Kianda Diversidade";

export const DEFAULT_NEWSLETTER_BODY = [
	"{{saudacao}}",
	"",
	"{{postagens}}",
	"",
	"Boa leitura!",
	"Equipe Kianda Diversidade",
	"",
	"Você recebe este e-mail porque se inscreveu na newsletter da Kianda Diversidade.",
	"© {{ano}} Kianda Diversidade",
].join("\n");

export const NEWSLETTER_EMAIL_PLACEHOLDERS = [
	{ token: "{{titulo}}", description: "Título da edição" },
	{ token: "{{saudacao}}", description: "Saudação inicial" },
	{ token: "{{postagens}}", description: "Lista de postagens" },
	{ token: "{{ano}}", description: "Ano atual" },
] as const;

export const EMAIL_TEMPLATE_PLACEHOLDERS = [
	{ token: "{{nome}}", description: "Nome do site (Kianda Diversidade)" },
	{ token: "{{site}}", description: "URL do site" },
	{ token: "{{ano}}", description: "Ano atual" },
	{ token: "{{descadastro}}", description: "Link para cancelar a inscrição" },
] as const;

const DEFAULT_TEMPLATES: Record<
	EmailTemplateKey,
	{ subject: string; body: string }
> = {
	[EMAIL_TEMPLATE_KEYS.welcome]: {
		subject: DEFAULT_WELCOME_SUBJECT,
		body: DEFAULT_WELCOME_BODY,
	},
	[EMAIL_TEMPLATE_KEYS.newsletter]: {
		subject: DEFAULT_NEWSLETTER_SUBJECT,
		body: DEFAULT_NEWSLETTER_BODY,
	},
};

export async function getEmailTemplate(key: string) {
	return prisma.emailTemplate.findUnique({ where: { key } });
}

/**
 * Devolve o modelo salvo ou o padrão (sem persistir), para que a tela do
 * painel funcione mesmo antes da primeira edição.
 */
export async function getEmailTemplateOrDefault(
	key: EmailTemplateKey,
): Promise<EmailTemplate> {
	const saved = await getEmailTemplate(key);
	if (saved) return saved;

	const fallback = DEFAULT_TEMPLATES[key] ?? DEFAULT_TEMPLATES.welcome;

	return {
		id: "default",
		key,
		subject: fallback.subject,
		body: fallback.body,
		updated_at: new Date(0),
	};
}

export async function upsertEmailTemplate(input: {
	key: EmailTemplateKey;
	subject: string;
	body: string;
}) {
	return prisma.emailTemplate.upsert({
		where: { key: input.key },
		create: {
			key: input.key,
			subject: input.subject,
			body: input.body,
		},
		update: {
			subject: input.subject,
			body: input.body,
		},
	});
}
