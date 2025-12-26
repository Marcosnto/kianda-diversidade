import ArticleCard from "@/components/card";
import { getArticles } from "@/services/get-articles";

const Posts = async () => {
  const { data } = await getArticles();
  return (
    <ul className="flex flex-col gap-8 my-10 ml-3">
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
  );
};

export default Posts;
