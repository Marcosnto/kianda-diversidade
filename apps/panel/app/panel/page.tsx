import { getAuthorizationContext, getPrimaryRole } from "@/lib/authorization";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

const ROLE_CONTENT = {
  administrator: {
    title: "Painel administrativo",
    description: "Gerencie o site, os artigos e os usuários da plataforma.",
  },
  author: {
    title: "Painel do autor",
    description: "Crie conteúdos e gerencie os artigos publicados por você.",
  },
  patient: {
    title: "Olá!",
    description: "Seu perfil de paciente está ativo.",
  },
};

export default async function Panel() {
  const authorization = await getAuthorizationContext();
  const role = authorization ? getPrimaryRole(authorization) : "patient";
  const content = ROLE_CONTENT[role];

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 sm:p-6">
      <h1 className="text-2xl font-bold tracking-tight">{content.title}</h1>
      <p className="text-muted-foreground">{content.description}</p>
      {role === "patient" && (
        <Button asChild className="mt-4 w-fit">
          <Link href="/panel/therapeutic-contract">
            Preencher contrato terapêutico
          </Link>
        </Button>
      )}
    </div>
  );
}
