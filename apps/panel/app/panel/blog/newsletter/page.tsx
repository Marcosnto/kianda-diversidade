import { getArticles } from "@workspace/db/articles";
import {
  EMAIL_TEMPLATE_KEYS,
  getEmailTemplateOrDefault,
} from "@workspace/db/email-templates";
import { countConfirmedSubscribers } from "@workspace/db/newsletter";
import { Button } from "@workspace/ui/components/button";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import { PERMISSIONS } from "@/lib/authorization";
import { isEmailConfigured } from "@/lib/email";
import { requirePagePermission } from "@/lib/page-authorization";
import { NewsletterCampaignForm } from "./newsletter-campaign-form";

export const dynamic = "force-dynamic";

export default async function NewsletterCampaignPage() {
  await requirePagePermission(PERMISSIONS.manageSite);

  const [articles, subscriberCount, template] = await Promise.all([
    getArticles(),
    countConfirmedSubscribers(),
    getEmailTemplateOrDefault(EMAIL_TEMPLATE_KEYS.newsletter),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Disparo da newsletter
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monte o e-mail, escolha as postagens e envie para os inscritos
            confirmados.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/panel/blog/newsletter/subscribers">
            <UsersRound />
            Ver inscritos
          </Link>
        </Button>
      </header>

      <NewsletterCampaignForm
        articles={articles}
        defaultTemplate={template.body}
        defaultTitle={template.subject}
        emailConfigured={isEmailConfigured()}
        subscriberCount={subscriberCount}
      />
    </div>
  );
}
