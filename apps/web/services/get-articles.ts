"use server";
type DataType = {
  id: string;
  Titulo: string;
  Resumo: string;
  author: string;
  Publicacao: string;
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
  const articles = await fetch(
    `${process.env.API_BASE_URL}/api/articles?populate=*`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    }
  );

  //TODO Filtrar somente os 3 primeiros com o Destaque === true
  const { data }: { data: DataType } = await articles.json();

  return {
    data,
  };
}
