import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
	EMAIL_TEMPLATE_KEYS,
	getEmailTemplateOrDefault,
} from "@workspace/db/email-templates";
import { renderEmail } from "./email-template-render";

const region = process.env.AWS_SES_REGION ?? "sa-east-1";

let client: SESClient | null = null;

function getClient() {
	if (!client) {
		client = new SESClient({
			region,
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
			},
		});
	}

	return client;
}

function getSiteUrl() {
	const explicit = process.env.NEXT_PUBLIC_SITE_URL;
	if (explicit) return explicit.replace(/\/+$/, "");

	const vercel = process.env.VERCEL_URL;
	if (vercel) return `https://${vercel}`;

	return "http://localhost:3001";
}

type SendNewsletterConfirmationParams = {
	to: string;
	token: string;
};

/**
 * Envia o e-mail de confirmação da newsletter via AWS SES.
 * Retorna `false` quando o SES não está configurado, para que a inscrição
 * permaneça salva no banco mesmo sem envio.
 */
export async function sendNewsletterConfirmation({
	to,
	token,
}: SendNewsletterConfirmationParams) {
	const from = process.env.AWS_SES_FROM_EMAIL;
	if (!from) {
		console.warn(
			"AWS_SES_FROM_EMAIL não configurado: e-mail de confirmação não enviado.",
		);
		return false;
	}

	const confirmUrl = `${getSiteUrl()}/newsletter/confirmar?token=${encodeURIComponent(token)}`;

	const textBody = [
		"Oi! Falta só um passo para você receber as novidades da Kianda Diversidade.",
		"",
		`Confirme sua inscrição acessando: ${confirmUrl}`,
		"",
		"Se você não fez essa inscrição, basta ignorar este e-mail.",
		"",
		"Kianda Diversidade",
	].join("\n");

	const htmlBody = `
		<div style="font-family: Arial, sans-serif; color: #273618; line-height: 1.6;">
			<p>Oi!</p>
			<p>Falta só um passo para você receber as novidades da Kianda Diversidade.</p>
			<p>
				<a href="${confirmUrl}" style="display: inline-block; background: #273618; color: #f3f1e4; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
					Confirmar inscrição
				</a>
			</p>
			<p>Se você não fez essa inscrição, basta ignorar este e-mail.</p>
			<p>Kianda Diversidade</p>
		</div>
	`;

	try {
		await getClient().send(
			new SendEmailCommand({
				Source: from,
				Destination: { ToAddresses: [to] },
				Message: {
					Subject: {
						Data: "Confirme sua inscrição na Kianda Diversidade",
						Charset: "UTF-8",
					},
					Body: {
						Text: { Data: textBody, Charset: "UTF-8" },
						Html: { Data: htmlBody, Charset: "UTF-8" },
					},
				},
			}),
		);
		return true;
	} catch (error) {
		console.error("Falha ao enviar e-mail de confirmação via SES", error);
		return false;
	}
}

type SendWelcomeEmailParams = {
	to: string;
	unsubscribeToken?: string | null;
};

/**
 * Envia o e-mail de boas-vindas após a confirmação da inscrição.
 * O assunto e o corpo vêm do modelo editável no painel (`/panel/email`).
 */
export async function sendWelcomeEmail({
	to,
	unsubscribeToken,
}: SendWelcomeEmailParams) {
	const from = process.env.AWS_SES_FROM_EMAIL;
	if (!from) {
		console.warn(
			"AWS_SES_FROM_EMAIL não configurado: e-mail de boas-vindas não enviado.",
		);
		return false;
	}

	const siteUrl = getSiteUrl();
	const template = await getEmailTemplateOrDefault(EMAIL_TEMPLATE_KEYS.welcome);

	const unsubscribeUrl = unsubscribeToken
		? `${siteUrl}/newsletter/descadastrar?token=${encodeURIComponent(unsubscribeToken)}`
		: `${siteUrl}/newsletter/descadastrar`;

	const { html, text } = renderEmail(template.body, {
		siteName: "Kianda Diversidade",
		siteUrl,
		year: new Date().getFullYear(),
		unsubscribeUrl,
	});

	try {
		await getClient().send(
			new SendEmailCommand({
				Source: from,
				Destination: { ToAddresses: [to] },
				Message: {
					Subject: { Data: template.subject, Charset: "UTF-8" },
					Body: {
						Text: { Data: text, Charset: "UTF-8" },
						Html: { Data: html, Charset: "UTF-8" },
					},
				},
			}),
		);
		return true;
	} catch (error) {
		console.error("Falha ao enviar e-mail de boas-vindas via SES", error);
		return false;
	}
}
