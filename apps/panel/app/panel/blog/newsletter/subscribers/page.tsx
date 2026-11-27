import { listAllSubscribers } from "@workspace/db/newsletter";
import { PERMISSIONS } from "@/lib/authorization";
import { requirePagePermission } from "@/lib/page-authorization";
import { SubscribersTable } from "./subscribers-table";

export const dynamic = "force-dynamic";

export default async function NewsletterSubscribersPage() {
  await requirePagePermission(PERMISSIONS.manageSite);

  const subscribers = await listAllSubscribers();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Inscritos</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Consulte e remova os e-mails cadastrados na newsletter.
        </p>
      </header>

      <SubscribersTable subscribers={subscribers} />
    </div>
  );
}
