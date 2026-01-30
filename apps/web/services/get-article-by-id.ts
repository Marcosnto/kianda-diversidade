import { DataType } from "./get-articles";

export async function getArticleById(documentId: string) {
  const response = await fetch(
    `${process.env.API_BASE_URL}/api/articles/${documentId}?populate[0]=Capa&populate[1]=createdBy`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const { data }: { data: DataType } = await response.json();
  return data;
}
