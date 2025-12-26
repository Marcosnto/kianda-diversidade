import ArticleCard from "@/components/card";
import HomeTitle from "@/components/home-title";
import Section from "@/components/section";

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

export default async function Articles() {
  //TODO Adequar esse get ao padrão next
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

  return (
    <Section className="mb-3">
      <HomeTitle>Artigos e Publicações</HomeTitle>
      <ul className="flex flex-col gap-2">
        {data.map(({ id, Titulo, Resumo, Publicacao, Capa }) => (
          <ArticleCard
            key={id}
            id={id}
            title={Titulo}
            author={"Autor Teste"}
            date={Publicacao}
            coverImage={Capa.url}
          />
        ))}
      </ul>
    </Section>
  );
}
