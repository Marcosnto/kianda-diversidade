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
          "grid grid-cols-1 gap-6 my-6 sm:gap-8 sm:my-10",
          "md:grid-cols-1",
          "lg:grid-cols-3 lg:gap-10 lg:py-12",
          "xl:gap-12",
          "2xl:gap-14 2xl:py-16",
        )}
      >
        {data?.map(({ id, Titulo, Publicacao, Capa, documentId }) => (
          <li key={id} className="w-full">
            <ArticleCard
              id={documentId}
              title={Titulo}
              author={"Autor Teste"}
              date={Publicacao}
              coverImage={Capa.url}
              linkClassName="w-full"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Posts;
