import { cn } from "@workspace/ui/lib/utils";

type ArticleCardSkeletonProps = {
  count?: number;
  className?: string;
  itemClassName?: string;
};

export function ArticleCardSkeleton({
  count = 3,
  className,
  itemClassName,
}: ArticleCardSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3 lg:gap-10",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          className={cn("flex w-full gap-3 lg:flex-col", itemClassName)}
          key={`article-skeleton-${index}`}
        >
          <div className="h-[100px] w-[120px] flex-shrink-0 animate-pulse rounded-3xl bg-k-olive-dark/10 sm:h-[120px] sm:w-[140px] md:h-[140px] md:w-[151px] lg:aspect-video lg:h-auto lg:w-full lg:rounded-b-2xl" />
          <div className="flex flex-1 flex-col justify-center gap-3 lg:p-4 xl:p-5">
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-k-olive-dark/10" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-k-olive-dark/10" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-k-olive-dark/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
