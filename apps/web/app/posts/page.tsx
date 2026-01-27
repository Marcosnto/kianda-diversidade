import ArticleCard from "@/components/card";
import { getArticles } from "@/services/get-articles";
import { cn } from "@workspace/ui/lib/utils";

const Posts = async () => {
  const data = await getArticles();

  if (!data) {
    <p>Não há artigos para serem mostrados</p>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl mx-auto">
      <ul
        className={cn(
          "flex flex-col gap-6 sm:gap-8 my-6 sm:my-10",
          "md:flex-row md:flex-wrap md:justify-start",
          "lg:gap-10 py-12",
          "xl:gap-12",
          "2xl:gap-14 2xl:py-16",
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
    </div>
  );
};

export default Posts;
