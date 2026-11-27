/**
 * Modelo (template) do e-mail da newsletter.
 *
 * O texto do modelo é salvo com marcadores que são substituídos no momento do
 * envio e também na pré-visualização exibida no painel:
 *
 * - `{{titulo}}`   → título da edição (assunto do e-mail)
 * - `{{saudacao}}` → saudação inicial
 * - `{{postagens}}` → lista das postagens selecionadas
 * - `{{ano}}`      → ano atual
 */

export type NewsletterTemplateArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  coverUrl: string | null;
  date: string;
};

export type NewsletterTemplateData = {
  title: string;
  greeting: string;
  articles: NewsletterTemplateArticle[];
  year: number;
  siteUrl: string;
  /** Link de descadastro específico do destinatário. */
  unsubscribeUrl?: string;
};

function unsubscribeUrl(data: NewsletterTemplateData) {
  return data.unsubscribeUrl ?? `${data.siteUrl}/newsletter/descadastrar`;
}

export const NEWSLETTER_TEMPLATE_PLACEHOLDERS = [
  { token: "{{titulo}}", description: "Título da edição" },
  { token: "{{saudacao}}", description: "Saudação inicial" },
  { token: "{{postagens}}", description: "Lista de postagens" },
  { token: "{{ano}}", description: "Ano atual" },
] as const;

export const DEFAULT_NEWSLETTER_GREETING =
  "Oi! Separamos as novidades mais recentes da Kianda Diversidade para você.";

export function buildDefaultNewsletterTemplate() {
  return [
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
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDatePtBR(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderArticleText(article: NewsletterTemplateArticle) {
  return [
    `• ${article.title}`,
    article.summary ? `  ${article.summary}` : "",
    `  Leia em: ${article.url}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function renderArticleHtml(article: NewsletterTemplateArticle) {
  const cover = article.coverUrl
    ? `<img src="${escapeHtml(article.coverUrl)}" alt="${escapeHtml(article.title)}" width="180" style="width: 180px; max-width: 100%; height: auto; border-radius: 6px; display: block;" />`
    : "";
  const date = formatDatePtBR(article.date);

  return `
		<div style="margin-bottom: 32px;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
				<tr>
					${cover ? `<td width="180" valign="top" style="width: 180px; padding-right: 16px;">${cover}</td>` : ""}
					<td valign="top" style="vertical-align: top;">
						${date ? `<p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: #6b7280;">${escapeHtml(date)}</p>` : ""}
						<h2 style="margin: 0 0 6px; font-size: 17px; line-height: 1.3; color: #273618;">${escapeHtml(article.title)}</h2>
						${article.summary ? `<p style="margin: 0 0 10px; font-size: 14px; line-height: 1.55; color: #374151;">${escapeHtml(article.summary)}</p>` : ""}
						<a href="${escapeHtml(article.url)}" style="display: inline-block; background: #273618; color: #f3f1e4; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">Ler postagem</a>
					</td>
				</tr>
			</table>
		</div>
	`;
}

function fillPlaceholders(
  template: string,
  data: NewsletterTemplateData,
  values: { articlesText: string; articlesHtml: string },
) {
  return template
    .replaceAll("{{titulo}}", data.title)
    .replaceAll("{{saudacao}}", data.greeting)
    .replaceAll("{{postagens}}", values.articlesText)
    .replaceAll("{{ano}}", String(data.year));
}

/**
 * Versão em texto puro, usada como fallback em clientes de e-mail.
 */
export function renderNewsletterText(
  template: string,
  data: NewsletterTemplateData,
) {
  const articlesText = data.articles.map(renderArticleText).join("\n\n");

  return fillPlaceholders(template, data, { articlesText, articlesHtml: "" })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Versão em HTML enviada por e-mail. O texto digitado pelo admin é convertido
 * em parágrafos, preservando quebras de linha.
 */
export function renderNewsletterHtml(
  template: string,
  data: NewsletterTemplateData,
) {
  const blocks = template.split("{{postagens}}");
  const articlesHtml = data.articles.map(renderArticleHtml).join("");

  const body = blocks
    .map((block, index) => {
      const filled = fillPlaceholders(block, data, {
        articlesText: "",
        articlesHtml,
      })
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map(
          (paragraph) =>
            `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #374151;">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`,
        )
        .join("");

      return index === 0 ? filled : `${articlesHtml}${filled}`;
    })
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${escapeHtml(data.title)}</title>
	</head>
	<body style="margin: 0; padding: 0; background: #f3f1e4;">
		<div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(data.title)}</div>
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f3f1e4; padding: 24px 12px;">
			<tr>
				<td align="center">
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; padding: 32px; font-family: Arial, Helvetica, sans-serif;">
						<tr>
							<td>
								<p style="margin: 0 0 24px; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; color: #273618; font-weight: 700;">Kianda Diversidade</p>
								<h1 style="margin: 0 0 24px; font-size: 26px; line-height: 1.25; color: #273618;">${escapeHtml(data.title)}</h1>
								${body}
								<p style="margin: 32px 0 0; font-size: 12px; line-height: 1.6; color: #9ca3af;">
									Você recebe este e-mail porque se inscreveu na newsletter da Kianda Diversidade.
									<a href="${escapeHtml(unsubscribeUrl(data))}" style="color: #9ca3af;">Cancelar inscrição</a>
								</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`;
}
