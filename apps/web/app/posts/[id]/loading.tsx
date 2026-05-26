export default function Loading() {
  return (
    <article className="mx-auto w-full max-w-7xl px-4 pt-[88px] pb-6 sm:px-6 sm:pt-28 sm:pb-8 lg:px-8 lg:pt-32 lg:pb-12 xl:px-12">
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col lg:w-[30%] lg:flex-shrink-0">
          <div className="mb-3 aspect-[16/10] w-full animate-pulse rounded-lg bg-k-olive-dark/10 sm:aspect-[4/3] sm:rounded-xl lg:mb-6 lg:aspect-square" />
          <div className="mb-3 h-8 w-4/5 animate-pulse rounded-full bg-k-olive-dark/10" />
          <div className="h-5 w-3/5 animate-pulse rounded-full bg-k-olive-dark/10" />
          <div className="mt-2 h-4 w-2/5 animate-pulse rounded-full bg-k-olive-dark/10" />
        </div>
        <div className="min-w-0 flex-1 lg:w-[70%]">
          <div className="rounded-lg bg-k-olive-light/40 p-4 sm:rounded-xl sm:p-6 lg:p-8 xl:p-10">
            <div className="space-y-4">
              <div className="h-5 w-full animate-pulse rounded-full bg-white/30" />
              <div className="h-5 w-11/12 animate-pulse rounded-full bg-white/30" />
              <div className="h-5 w-10/12 animate-pulse rounded-full bg-white/30" />
              <div className="h-5 w-full animate-pulse rounded-full bg-white/30" />
              <div className="h-5 w-8/12 animate-pulse rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
