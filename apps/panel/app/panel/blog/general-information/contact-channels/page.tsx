import { ContactChannelsForm } from "./contact-channels-form";
import { getContactChannels } from "@workspace/db/contact-channels";

export const dynamic = "force-dynamic";

export default async function ContactChannelsPage() {
  const channels = await getContactChannels();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Canais para contato
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie os links das redes sociais exibidos no rodapé do site.
        </p>
      </header>

      <section className="rounded-lg border bg-background p-5 sm:p-6">
        <ContactChannelsForm
          defaults={{
            youtube: channels?.youtube ?? "",
            linkedin: channels?.linkedin ?? "",
            instagram: channels?.instagram ?? "",
            threads: channels?.threads ?? "",
            facebook: channels?.facebook ?? "",
            whatsapp: channels?.whatsapp ?? "",
            tiktok: channels?.tiktok ?? "",
            x: channels?.x ?? "",
          }}
        />
      </section>
    </div>
  );
}
