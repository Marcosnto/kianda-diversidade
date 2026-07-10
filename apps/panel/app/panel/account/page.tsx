import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  CalendarDays,
  FileText,
  Fingerprint,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getAuthorizationContext, getPrimaryRole } from "@/lib/authorization";
import { getCurrentDatabaseUser } from "@/lib/current-user";
import { AccountPictureForm } from "./account-picture-form";
import { AuthorProfileForm } from "./author-profile-form";

export const dynamic = "force-dynamic";

function getAuthProvider(auth0Id: string) {
  const provider = auth0Id.split("|")[0];

  const labels: Record<string, string> = {
    auth0: "E-mail e senha",
    "google-oauth2": "Google",
  };

  return labels[provider ?? ""] ?? provider ?? "Auth0";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AccountPage() {
  const [user, authorization] = await Promise.all([
    getCurrentDatabaseUser(),
    getAuthorizationContext(),
  ]);
  const role = authorization ? getPrimaryRole(authorization) : "patient";
  const roleLabel = {
    administrator: "Administrador",
    author: "Autor",
    patient: "Paciente",
  }[role];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Conta</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Consulte os dados do seu perfil e sua atividade no painel.
        </p>
      </header>

      <section className="flex flex-col gap-5 rounded-lg border bg-background p-5 sm:flex-row sm:items-center sm:p-6">
        <AccountPictureForm name={user.name} picture={user.picture} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold sm:text-2xl">
              {user.name}
            </h2>
            <Badge variant="success">
              <ShieldCheck />
              {roleLabel}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 truncate text-sm">
            {user.email ?? "E-mail não informado"}
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            Nome e e-mail são sincronizados com o Auth0. A imagem pode ser
            personalizada no painel.
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-background">
        <div className="p-5 sm:p-6">
          <h2 className="font-semibold">Informações do perfil</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Dados utilizados para identificar a autoria dos artigos.
          </p>
        </div>
        <Separator />
        <dl className="grid gap-0 sm:grid-cols-2">
          <ProfileItem icon={UserRound} label="Nome" value={user.name} />
          <ProfileItem
            icon={Mail}
            label="E-mail"
            value={user.email ?? "Não informado"}
          />
          <ProfileItem
            icon={Fingerprint}
            label="Provedor de acesso"
            value={getAuthProvider(user.auth0_id)}
          />
          <ProfileItem
            icon={CalendarDays}
            label="Conta criada em"
            value={formatDate(user.created_at)}
          />
        </dl>
      </section>

      <section className="rounded-lg border bg-background p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold">Perfil público do autor</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            O perfil ficará disponível no site quando você possuir um artigo
            publicado.
          </p>
        </div>
        <AuthorProfileForm
          defaults={{
            bio: user.bio ?? "",
            website: user.website ?? "",
            instagram: user.instagram ?? "",
            linkedin: user.linkedin ?? "",
            youtube: user.youtube ?? "",
            tiktok: user.tiktok ?? "",
            x: user.x ?? "",
          }}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-lg border bg-background p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FileText className="size-5" />
          </span>
          <div>
            <p className="text-2xl font-semibold">{user._count.articles}</p>
            <p className="text-muted-foreground text-sm">
              {user._count.articles === 1
                ? "Artigo publicado por você"
                : "Artigos publicados por você"}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-lg border bg-background p-5">
          <div>
            <h2 className="font-semibold">Sessão</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Encerre seu acesso neste dispositivo.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-fit">
            <a href="/auth/logout">
              <LogOut />
              Sair da conta
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 border-b p-5 last:border-b-0 sm:p-6 sm:odd:border-r sm:nth-last-2:border-b-0">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs font-medium uppercase">
          {label}
        </dt>
        <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
