type ArticlesEmptyStateProps = {
  title?: string;
  description?: string;
};

export function ArticlesEmptyState({
  title = "Ainda não há artigos publicados.",
  description = "Volte em breve para acompanhar novos conteúdos da Kianda Diversidade.",
}: ArticlesEmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-k-olive-deep md:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-base leading-7 text-k-olive-dark md:text-lg">
        {description}
      </p>
    </div>
  );
}
