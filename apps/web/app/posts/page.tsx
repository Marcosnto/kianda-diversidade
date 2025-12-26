import ArticleCard from "@/components/card";
import { getArticles } from "@/services/get-articles";

const Posts = async () => {
  const data = await getArticles();

  if (!data) {
    <p>Não há artigos para serem mostrados</p>;
  }

  return (
    <ul className="flex flex-col gap-8 my-10 ml-3">
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
  );
};

export default Posts;
