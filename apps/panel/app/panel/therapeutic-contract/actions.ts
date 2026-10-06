"use server";

import {
  type TherapeuticContractInput,
  upsertTherapeuticContract,
} from "@workspace/db/therapeutic-contract";
import { revalidatePath } from "next/cache";
import { getAuthorizationContext, hasRole } from "@/lib/authorization";
import { getCurrentDatabaseUser } from "@/lib/current-user";
import {
  CONTRACT_SELECT_OPTIONS,
  isContractOption,
} from "@/lib/therapeutic-contract";

export type TherapeuticContractFormData = Record<string, string | boolean>;

type Result = { ok: true } | { ok: false; error: string };

const REQUIRED_TEXT_FIELDS = [
  "full_name",
  "rg",
  "email",
  "contact",
  "address",
  "profession",
  "ethnicity",
  "sexual_orientation",
  "pronouns",
  "gender",
  "marital_status",
  "emergency_contact_1_name",
  "emergency_contact_1_phone",
  "emergency_contact_1_relationship",
  "emergency_contact_2_name",
  "emergency_contact_2_phone",
  "emergency_contact_2_relationship",
] as const;

function text(data: TherapeuticContractFormData, field: string) {
  return String(data[field] ?? "").trim();
}

export async function saveTherapeuticContractAction(
  formData: TherapeuticContractFormData,
): Promise<Result> {
  const authorization = await getAuthorizationContext();
  if (!authorization || !hasRole(authorization, "patient")) {
    return { ok: false, error: "Você não tem acesso a este contrato." };
  }

  for (const field of REQUIRED_TEXT_FIELDS) {
    if (!text(formData, field)) {
      return { ok: false, error: "Preencha todos os campos obrigatórios." };
    }
  }

  const cpf = text(formData, "cpf").replace(/\D/g, "");
  if (!/^\d{11}$/.test(cpf)) {
    return { ok: false, error: "Informe um CPF com 11 dígitos." };
  }

  const birthDate = text(formData, "birth_date");
  const parsedBirthDate = new Date(`${birthDate}T12:00:00.000Z`);
  if (!birthDate || Number.isNaN(parsedBirthDate.getTime())) {
    return { ok: false, error: "Informe uma data de nascimento válida." };
  }

  if (!/^\S+@\S+\.\S+$/.test(text(formData, "email"))) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  if (
    !isContractOption(
      CONTRACT_SELECT_OPTIONS.education_level,
      text(formData, "education_level"),
    ) ||
    !isContractOption(
      CONTRACT_SELECT_OPTIONS.ethnicity,
      text(formData, "ethnicity"),
    ) ||
    !isContractOption(
      CONTRACT_SELECT_OPTIONS.pronouns,
      text(formData, "pronouns"),
    ) ||
    !isContractOption(
      CONTRACT_SELECT_OPTIONS.gender,
      text(formData, "gender"),
    ) ||
    !isContractOption(
      CONTRACT_SELECT_OPTIONS.marital_status,
      text(formData, "marital_status"),
    ) ||
    !isContractOption(
      CONTRACT_SELECT_OPTIONS.emergency_relationship,
      text(formData, "emergency_contact_1_relationship"),
    ) ||
    !isContractOption(
      CONTRACT_SELECT_OPTIONS.emergency_relationship,
      text(formData, "emergency_contact_2_relationship"),
    )
  ) {
    return { ok: false, error: "Selecione uma opção válida nas listas." };
  }

  const hasChildren = formData.has_children === true;
  const hasDisability = formData.has_disability === true;
  const isPartnered = ["Casado(a)", "União estável"].includes(
    text(formData, "marital_status"),
  );
  const childrenCount = Number(text(formData, "children_count"));

  if (hasChildren && (!Number.isInteger(childrenCount) || childrenCount < 1)) {
    return { ok: false, error: "Informe a quantidade de filhos." };
  }
  if (text(formData, "gender") === "Outro" && !text(formData, "gender_other")) {
    return { ok: false, error: "Especifique o gênero informado." };
  }
  if (hasDisability && !text(formData, "disability_details")) {
    return { ok: false, error: "Descreva a deficiência informada." };
  }
  if (isPartnered && !text(formData, "spouse")) {
    return { ok: false, error: "Informe o nome do cônjuge ou companheiro(a)." };
  }

  const input: TherapeuticContractInput = {
    full_name: text(formData, "full_name"),
    birth_date: parsedBirthDate,
    rg: text(formData, "rg"),
    cpf,
    email: text(formData, "email"),
    contact: text(formData, "contact"),
    address: text(formData, "address"),
    education_level: text(formData, "education_level"),
    profession: text(formData, "profession"),
    ethnicity: text(formData, "ethnicity"),
    sexual_orientation: text(formData, "sexual_orientation"),
    pronouns: text(formData, "pronouns"),
    gender: text(formData, "gender"),
    gender_other: text(formData, "gender_other") || null,
    marital_status: text(formData, "marital_status"),
    has_children: hasChildren,
    children_count: hasChildren ? childrenCount : null,
    religion: text(formData, "religion") || null,
    has_disability: hasDisability,
    disability_details: hasDisability
      ? text(formData, "disability_details")
      : null,
    needs_adaptation: hasDisability ? formData.needs_adaptation === true : null,
    spouse: isPartnered ? text(formData, "spouse") : null,
    emergency_contact_1_name: text(formData, "emergency_contact_1_name"),
    emergency_contact_1_phone: text(formData, "emergency_contact_1_phone"),
    emergency_contact_1_relationship: text(
      formData,
      "emergency_contact_1_relationship",
    ),
    emergency_contact_2_name: text(formData, "emergency_contact_2_name"),
    emergency_contact_2_phone: text(formData, "emergency_contact_2_phone"),
    emergency_contact_2_relationship: text(
      formData,
      "emergency_contact_2_relationship",
    ),
  };

  try {
    const user = await getCurrentDatabaseUser();
    await upsertTherapeuticContract(user.id, input);
    revalidatePath("/panel/therapeutic-contract");
    return { ok: true };
  } catch (error) {
    console.error("Erro ao salvar contrato terapêutico", error);
    return { ok: false, error: "Não foi possível salvar o contrato." };
  }
}
