export async function getArticleById(documentId: string) {
  const response = await fetch(
    `${process.env.API_BASE_URL}/api/articles/${documentId}?populate=*`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    return null;
  }

  const { data } = await response.json();
  return data;
}
