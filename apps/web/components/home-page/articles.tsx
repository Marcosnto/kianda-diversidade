import ArticleCard from "@/components/card";
import HomeTitle from "@/components/home-title";
import Section from "@/components/section";
import { getArticles } from "@/services/get-articles";

export default async function Articles() {
  const { data } = await getArticles();

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
