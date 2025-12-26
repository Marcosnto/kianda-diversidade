import ArticleCard from "@/components/card";
import HomeTitle from "@/components/home-title";
import Section from "@/components/section";
import { getArticles } from "@/services/get-articles";

export default async function Articles() {
  const data = await getArticles();

  if (!data) {
    <p>Não há artigos</p>;
  }

  return (
    <Section className="mb-3">
      <HomeTitle>Artigos e Publicações</HomeTitle>
      <ul className="flex flex-col gap-2">
        {data?.map(({ id, Titulo, Resumo, Publicacao, Capa, documentId }) => (
          <ArticleCard
            key={id}
            id={documentId}
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
