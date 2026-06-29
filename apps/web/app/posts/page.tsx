import { ArticlesEmptyState } from "@/components/articles-empty-state";
import { ArticlesFilter } from "@/components/articles-filter";
import { getPublishedArticles } from "@workspace/db/articles";

export const revalidate = 15;

type PostsPageProps = {
  searchParams: Promise<{
    busca?: string | string[];
  }>;
};

const Posts = async ({ searchParams }: PostsPageProps) => {
  const params = await searchParams;
  const rawSearch = Array.isArray(params.busca)
    ? params.busca[0]
    : params.busca;
  const initialSearch = rawSearch?.trim() ?? "";
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
    <div className="mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 xl:px-12 2xl:px-16">
      <ArticlesFilter articles={data} initialSearch={initialSearch} />
    </div>
  );
};

export default Posts;
