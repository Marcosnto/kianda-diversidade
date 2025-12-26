type DataType = {
  id: string;
  documentId: string;
  Titulo: string;
  Resumo: string;
  author: string;
  Publicacao: string;
  Destaque: boolean;
  Capa: {
    id: string | number;
    name: string;
    alternativeText?: string;
    width: number;
    heigth: number;
    ext: string;
    url: string;
  };
}[];

export async function getArticles() {
  const response = await fetch(
    `${process.env.API_BASE_URL}/api/articles?populate=*`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    }
  );

  if (!response.ok) {
    return null;
  }

  //TODO Filtrar somente os 3 primeiros com o Destaque === true
  const { data }: { data: DataType } = await response.json();

  return data;
}
