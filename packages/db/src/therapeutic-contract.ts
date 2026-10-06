import { prisma } from "./prisma";

export type TherapeuticContractInput = {
  full_name: string;
  birth_date: Date;
  rg: string;
  cpf: string;
  email: string;
  contact: string;
  address: string;
  education_level: string;
  profession: string;
  ethnicity: string;
  sexual_orientation: string;
  pronouns: string;
  gender: string;
  gender_other: string | null;
  marital_status: string;
  has_children: boolean;
  children_count: number | null;
  religion: string | null;
  has_disability: boolean;
  disability_details: string | null;
  needs_adaptation: boolean | null;
  spouse: string | null;
  emergency_contact_1_name: string;
  emergency_contact_1_phone: string;
  emergency_contact_1_relationship: string;
  emergency_contact_2_name: string;
  emergency_contact_2_phone: string;
  emergency_contact_2_relationship: string;
};

export function getTherapeuticContractByUserId(userId: string) {
  return prisma.therapeuticContract.findUnique({ where: { user_id: userId } });
}

export function upsertTherapeuticContract(
  userId: string,
  input: TherapeuticContractInput,
) {
  return prisma.therapeuticContract.upsert({
    where: { user_id: userId },
    create: { user_id: userId, ...input },
    update: input,
  });
}
