export default function formatDatePtBR(dateValue: Date | string | null) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
