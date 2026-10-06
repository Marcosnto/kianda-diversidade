import { getTherapeuticContractByUserId } from "@workspace/db/therapeutic-contract";
import { redirect } from "next/navigation";
import { getAuthorizationContext, hasRole } from "@/lib/authorization";
import { getCurrentDatabaseUser } from "@/lib/current-user";
import {
  type TherapeuticContractDefaults,
  TherapeuticContractForm,
} from "./therapeutic-contract-form";

export const dynamic = "force-dynamic";

function toDateInputValue(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function TherapeuticContractPage() {
  const authorization = await getAuthorizationContext();
  if (!authorization || !hasRole(authorization, "patient")) redirect("/panel");

  const user = await getCurrentDatabaseUser();
  const contract = await getTherapeuticContractByUserId(user.id);
  const defaults: TherapeuticContractDefaults = {
    full_name: contract?.full_name ?? user.name,
    birth_date: toDateInputValue(contract?.birth_date),
    rg: contract?.rg ?? "",
    cpf: contract?.cpf ?? "",
    email: contract?.email ?? user.email ?? "",
    contact: contract?.contact ?? "",
    address: contract?.address ?? "",
    education_level: contract?.education_level ?? "",
    profession: contract?.profession ?? "",
    ethnicity: contract?.ethnicity ?? "",
    sexual_orientation: contract?.sexual_orientation ?? "",
    pronouns: contract?.pronouns ?? "",
    gender: contract?.gender ?? "",
    gender_other: contract?.gender_other ?? "",
    marital_status: contract?.marital_status ?? "",
    children_count: contract?.children_count?.toString() ?? "",
    religion: contract?.religion ?? "",
    disability_details: contract?.disability_details ?? "",
    spouse: contract?.spouse ?? "",
    emergency_contact_1_name: contract?.emergency_contact_1_name ?? "",
    emergency_contact_1_phone: contract?.emergency_contact_1_phone ?? "",
    emergency_contact_1_relationship:
      contract?.emergency_contact_1_relationship ?? "",
    emergency_contact_2_name: contract?.emergency_contact_2_name ?? "",
    emergency_contact_2_phone: contract?.emergency_contact_2_phone ?? "",
    emergency_contact_2_relationship:
      contract?.emergency_contact_2_relationship ?? "",
    has_children: contract?.has_children ?? false,
    has_disability: contract?.has_disability ?? false,
    needs_adaptation: contract?.needs_adaptation ?? false,
  };

  return (
    <div className="mx-auto w-full max-w-4xl py-6 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Contrato terapêutico
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Preencha ou atualize seus dados para o acompanhamento terapêutico.
        </p>
      </header>
      <TherapeuticContractForm defaults={defaults} />
    </div>
  );
}
