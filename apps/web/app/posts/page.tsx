import ArticleCard from "@/components/card";
import { getArticles } from "@/services/get-articles";
import { cn } from "@workspace/ui/lib/utils";

const Posts = async () => {
  const data = await getArticles();

  if (!data) {
    <p>Não há artigos para serem mostrados</p>;
  }

  return (
    <ul
      className={cn(
        `flex flex-col gap-8 my-10 ml-3`,
        `md:flex-row md:flex-wrap`
      )}
    >
      {data?.map(({ id, Titulo, Resumo, Publicacao, Capa, documentId }) => (
        <ArticleCard
          key={id}
          id={documentId}
          title={Titulo}
          author={"Autor Teste"}
          date={Publicacao}
          coverImage={Capa.url}
          linkClassName=""
        />
      ))}
    </ul>
  );
};

export default Posts;
