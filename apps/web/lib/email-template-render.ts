/**
 * Renderização dos modelos de e-mail editáveis no painel.
 *
 * O corpo do modelo é texto simples com marcadores `{{...}}` substituídos no
 * momento do envio. Parágrafos são separados por linha em branco.
 */

export type EmailTemplateData = {
	siteName: string;
	siteUrl: string;
	year: number;
	unsubscribeUrl?: string;
};

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function fillPlaceholders(template: string, data: EmailTemplateData) {
	return template
		.replaceAll("{{nome}}", data.siteName)
		.replaceAll("{{site}}", data.siteUrl)
		.replaceAll("{{ano}}", String(data.year))
		.replaceAll(
			"{{descadastro}}",
			data.unsubscribeUrl ?? `${data.siteUrl}/newsletter/descadastrar`,
		);
}

export function renderEmailText(template: string, data: EmailTemplateData) {
	return fillPlaceholders(template, data).trim();
}

/**
 * Converte o texto do modelo em HTML simples, preservando parágrafos e
 * transformando URLs em links clicáveis.
 */
export function renderEmailHtml(template: string, data: EmailTemplateData) {
	const filled = fillPlaceholders(template, data).trim();

	const paragraphs = filled
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => {
			const html = block
				.split("\n")
				.map((line) => escapeHtml(line))
				.join("<br />")
				.replace(
					/(https?:\/\/[^\s<]+)/g,
					(url) =>
						`<a href="${url}" style="color: #273618; text-decoration: underline;">${url}</a>`,
				);

			return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #374151;">${html}</p>`;
		})
		.join("");

	return `
		<div style="background: #f3f1e4; padding: 32px 16px; font-family: Arial, Helvetica, sans-serif;">
			<div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px;">
				${paragraphs}
			</div>
		</div>
	`;
}

export function renderEmail(
	template: string,
	data: EmailTemplateData,
): { html: string; text: string } {
	return {
		html: renderEmailHtml(template, data),
		text: renderEmailText(template, data),
	};
}
