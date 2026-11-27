"use server";

import {
  getArticlesByIds,
  getLatestPublishedArticles,
} from "@workspace/db/articles";
import {
  EMAIL_TEMPLATE_KEYS,
  upsertEmailTemplate,
} from "@workspace/db/email-templates";
import { listNewsletterRecipients } from "@workspace/db/newsletter";
import { revalidatePath } from "next/cache";
import { PERMISSIONS, requirePermission } from "@/lib/authorization";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import {
  buildDefaultNewsletterTemplate,
  DEFAULT_NEWSLETTER_GREETING,
  type NewsletterTemplateArticle,
  renderNewsletterHtml,
  renderNewsletterText,
} from "@/lib/newsletter-template";

export type NewsletterArticlePreview = NewsletterTemplateArticle & {
  isPublished: boolean;
};

export type NewsletterSelectionInput = {
  mode: "latest" | "manual";
  latestCount: number;
  articleIds: string[];
};

export type NewsletterPreview = {
  title: string;
  greeting: string;
  articles: NewsletterArticlePreview[];
  html: string;
  text: string;
  recipientCount: number;
  emailConfigured: boolean;
};

export type NewsletterSendResult = {
  ok: boolean;
  error?: string;
  sent?: number;
  failed?: number;
  skipped?: number;
};

export type SaveNewsletterTemplateResult = {
  ok: boolean;
  error?: string;
};

const MAX_LATEST = 20;
const MAX_RECIPIENTS = 500;
const SEND_DELAY_MS = 120;

function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  return "http://localhost:3001";
}

function articleUrl(id: string) {
  return `${getSiteUrl()}/posts/${id}`;
}

function toTemplateArticle(
  article: Awaited<ReturnType<typeof getArticlesByIds>>[number],
): NewsletterArticlePreview {
  const publishedIn = article.published_in
    ? new Date(article.published_in)
    : null;

  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    url: articleUrl(article.id),
    coverUrl: article.cover_image?.url ?? null,
    date: publishedIn?.toISOString() ?? new Date().toISOString(),
    isPublished: Boolean(publishedIn && publishedIn <= new Date()),
  };
}

async function resolveArticles(input: NewsletterSelectionInput) {
  if (input.mode === "latest") {
    const count = Math.max(
      1,
      Math.min(Math.trunc(input.latestCount) || 1, MAX_LATEST),
    );
    const articles = await getLatestPublishedArticles(count);
    return articles.map(toTemplateArticle);
  }

  const ids = Array.from(new Set(input.articleIds.filter(Boolean)));
  const articles = await getArticlesByIds(ids);
  return articles.map(toTemplateArticle);
}

/**
 * Salva o modelo (assunto e corpo) usado no disparo da newsletter.
 * O conteúdo fica persistido em `email_templates` com a chave `newsletter`.
 */
export async function saveNewsletterTemplateAction(input: {
  title: string;
  greeting: string;
  template: string;
}): Promise<SaveNewsletterTemplateResult> {
  try {
    await requirePermission(PERMISSIONS.manageSite);

    const subject = input.title.trim();
    const body = input.template.trim();

    if (!subject) {
      return { ok: false, error: "Informe o assunto do e-mail." };
    }

    if (body.length < 20) {
      return { ok: false, error: "O modelo do e-mail está muito curto." };
    }

    if (!body.includes("{{postagens}}")) {
      return {
        ok: false,
        error: "O modelo precisa conter o marcador {{postagens}}.",
      };
    }

    await upsertEmailTemplate({
      key: EMAIL_TEMPLATE_KEYS.newsletter,
      subject,
      body,
    });
  } catch (error) {
    console.error("Erro ao salvar o modelo da newsletter", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o modelo.",
    };
  }

  revalidatePath("/panel/blog/newsletter");
  return { ok: true };
}

export async function previewNewsletterAction(input: {
  title: string;
  greeting: string;
  template: string;
  selection: NewsletterSelectionInput;
}): Promise<NewsletterPreview> {
  await requirePermission(PERMISSIONS.manageSite);

  const title = input.title.trim() || "Novidades da Kianda Diversidade";
  const greeting = input.greeting.trim() || DEFAULT_NEWSLETTER_GREETING;
  const template = input.template.trim() || buildDefaultNewsletterTemplate();
  const articles = await resolveArticles(input.selection);
  const recipients = await listNewsletterRecipients();

  const data = {
    title,
    greeting,
    articles,
    year: new Date().getFullYear(),
    siteUrl: getSiteUrl(),
  };

  return {
    title,
    greeting,
    articles,
    html: renderNewsletterHtml(template, data),
    text: renderNewsletterText(template, data),
    recipientCount: recipients.length,
    emailConfigured: isEmailConfigured(),
  };
}

export async function sendNewsletterAction(input: {
  title: string;
  greeting: string;
  template: string;
  selection: NewsletterSelectionInput;
}): Promise<NewsletterSendResult> {
  try {
    await requirePermission(PERMISSIONS.manageSite);

    if (!isEmailConfigured()) {
      return {
        ok: false,
        error:
          "Envio de e-mail não configurado. Defina AWS_SES_FROM_EMAIL, AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY no painel.",
      };
    }

    const title = input.title.trim();
    if (!title) {
      return { ok: false, error: "Informe o assunto do e-mail." };
    }

    const articles = await resolveArticles(input.selection);
    if (articles.length === 0) {
      return {
        ok: false,
        error: "Selecione ao menos uma postagem publicada.",
      };
    }

    const recipients = await listNewsletterRecipients();
    if (recipients.length === 0) {
      return {
        ok: false,
        error: "Não há inscritos confirmados para receber a newsletter.",
      };
    }

    const greeting = input.greeting.trim() || DEFAULT_NEWSLETTER_GREETING;
    const template = input.template.trim() || buildDefaultNewsletterTemplate();
    const year = new Date().getFullYear();
    const siteUrl = getSiteUrl();

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const [index, recipient] of recipients.entries()) {
      if (index >= MAX_RECIPIENTS) {
        skipped = recipients.length - MAX_RECIPIENTS;
        break;
      }

      const data = {
        title,
        greeting,
        articles,
        year,
        siteUrl,
        unsubscribeUrl: recipient.unsubscribeToken
          ? `${siteUrl}/newsletter/descadastrar?token=${encodeURIComponent(recipient.unsubscribeToken)}`
          : undefined,
      };

      try {
        await sendEmail({
          to: [recipient.email],
          subject: title,
          html: renderNewsletterHtml(template, data),
          text: renderNewsletterText(template, data),
        });
        sent += 1;
      } catch (error) {
        console.error(
          `Falha ao enviar newsletter para ${recipient.email}`,
          error,
        );
        failed += 1;
      }

      if (index < recipients.length - 1 && index + 1 < MAX_RECIPIENTS) {
        await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
      }
    }

    if (sent === 0) {
      return {
        ok: false,
        error:
          "Nenhum e-mail pôde ser enviado. Verifique as configurações do SES.",
        sent,
        failed,
        skipped,
      };
    }

    return { ok: true, sent, failed, skipped };
  } catch (error) {
    console.error("Erro ao disparar a newsletter", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Falha ao disparar a newsletter.",
    };
  }
}
