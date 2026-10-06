export const EDUCATION_LEVELS = [
  "Ensino fundamental incompleto",
  "Ensino fundamental completo",
  "Ensino médio incompleto",
  "Ensino médio completo",
  "Ensino superior incompleto",
  "Ensino superior completo",
  "Pós-graduação",
  "Mestrado",
  "Doutorado",
] as const;

export const ETHNICITIES = [
  "Amarela",
  "Branca",
  "Indígena",
  "Parda",
  "Preta",
  "Outra",
  "Prefiro não informar",
] as const;

export const PRONOUNS = [
  "Ela/dela",
  "Ele/dele",
  "Elu/delu",
  "Outro",
  "Prefiro não informar",
] as const;

export const GENDERS = [
  "Mulher cisgênero",
  "Homem cisgênero",
  "Mulher transgênero",
  "Homem transgênero",
  "Não binário",
  "Outro",
  "Prefiro não informar",
] as const;

export const MARITAL_STATUSES = [
  "Solteiro(a)",
  "Casado(a)",
  "União estável",
  "Divorciado(a)",
  "Viúvo(a)",
  "Prefiro não informar",
] as const;

export const EMERGENCY_RELATIONSHIPS = [
  "Cônjuge/companheiro(a)",
  "Mãe",
  "Pai",
  "Filho(a)",
  "Irmão(ã)",
  "Outro familiar",
  "Amigo(a)",
  "Outro",
] as const;

export const CONTRACT_SELECT_OPTIONS = {
  education_level: EDUCATION_LEVELS,
  ethnicity: ETHNICITIES,
  pronouns: PRONOUNS,
  gender: GENDERS,
  marital_status: MARITAL_STATUSES,
  emergency_relationship: EMERGENCY_RELATIONSHIPS,
} as const;

export function isContractOption(values: readonly string[], value: string) {
  return values.includes(value);
}
