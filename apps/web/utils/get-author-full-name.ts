type CreatedBy = {
  firstname?: string | null;
  lastname?: string | null;
};

const DEFAULT_AUTHOR = "Autor desconhecido";

export function getAuthorFullName(
  createdBy: CreatedBy | null | undefined,
): string {
  if (!createdBy) return DEFAULT_AUTHOR;

  const first = createdBy.firstname?.trim() ?? "";
  const last = createdBy.lastname?.trim() ?? "";
  const fullName = [first, last].filter(Boolean).join(" ");

  return fullName;
}
