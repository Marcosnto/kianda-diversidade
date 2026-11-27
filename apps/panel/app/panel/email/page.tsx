import {
  EMAIL_TEMPLATE_KEYS,
  getEmailTemplateOrDefault,
} from "@workspace/db/email-templates";
import { countConfirmedSubscribers } from "@workspace/db/newsletter";
import { PERMISSIONS } from "@/lib/authorization";
import { isEmailConfigured } from "@/lib/email";
import { requirePagePermission } from "@/lib/page-authorization";
import { WelcomeTemplateForm } from "./welcome-template-form";

export const dynamic = "force-dynamic";

function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  return "http://localhost:3001";
}

export default async function EmailPage() {
  await requirePagePermission(PERMISSIONS.manageSite);

  const [template, subscriberCount] = await Promise.all([
    getEmailTemplateOrDefault(EMAIL_TEMPLATE_KEYS.welcome),
    countConfirmedSubscribers(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">E-mails</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Edite os modelos de e-mail enviados automaticamente pelo site.
        </p>
      </header>

      {!isEmailConfigured() && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          O envio de e-mail ainda não está configurado. Defina{" "}
          <code>AWS_SES_FROM_EMAIL</code>, <code>AWS_ACCESS_KEY_ID</code> e{" "}
          <code>AWS_SECRET_ACCESS_KEY</code> para que os e-mails sejam enviados.
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">E-mail de boas-vindas</h2>
          <p className="text-muted-foreground text-sm">
            Enviado automaticamente quando alguém confirma a inscrição na
            newsletter. {subscriberCount} inscrito(s) confirmado(s).
          </p>
        </div>

        <WelcomeTemplateForm
          initialSubject={template.subject}
          initialBody={template.body}
          siteUrl={getSiteUrl()}
        />
      </section>
    </div>
  );
}
