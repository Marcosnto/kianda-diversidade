import { ArticlesEmptyState } from "@/components/articles-empty-state";
import ArticleCard from "@/components/card";
import { getPublishedArticles } from "@workspace/db/articles";
import { cn } from "@workspace/ui/lib/utils";

export const revalidate = 15;

const Posts = async () => {
  const data = await getPublishedArticles();

  if (!data.length) {
    return (
      <ArticlesEmptyState
        description="Assim que novos conteúdos forem publicados, eles aparecerão por aqui."
        title="Nenhum artigo publicado ainda."
      />
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl mx-auto">
      <ul
        className={cn(
          "grid grid-cols-1 gap-6 my-6 sm:gap-8 sm:my-10 py-16",
          "md:grid-cols-1",
          "lg:grid-cols-3 lg:gap-10",
          "xl:gap-12",
          "2xl:gap-14 2xl:py-16",
        )}
      >
        {data.map(({ id, title, published_in, cover_image }) => (
          <li key={id} className="w-full">
            <ArticleCard
              id={id}
              title={title}
              author="Kianda Diversidade"
              date={published_in}
              coverImage={cover_image?.url}
              linkClassName="w-full"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Posts;
