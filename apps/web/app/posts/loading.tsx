import { ArticleCardSkeleton } from "@/components/article-card-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <ArticleCardSkeleton count={6} />
    </div>
  );
}
