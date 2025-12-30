import ArticleCard from "@/components/card";
import HomeTitle from "@/components/home-title";
import Section from "@/components/section";
import { getArticles } from "@/services/get-articles";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";

export default async function Articles() {
  const articlesData = await getArticles();

  const bgColors = [
    "lg:bg-k-cinnamon",
    "lg:bg-k-olive-dark",
    "lg:bg-k-orange",
    "lg:bg-k-cinnamon",
  ];

  if (!articlesData) {
    return <p>Não há artigos</p>;
  }

  // Sort by publication date descending
  const sortedArticles = [...articlesData].sort((a, b) => {
    const dateA = new Date(a.Publicacao).getTime();
    const dateB = new Date(b.Publicacao).getTime();
    return dateB - dateA;
  });

  const featuredArticles = sortedArticles.filter((item) => item.Destaque);
  const nonFeaturedArticles = sortedArticles.filter((item) => !item.Destaque);

  const topFeatured = featuredArticles.slice(0, 4);

  const missingCount = 4 - topFeatured.length;
  const complementaryArticles =
    missingCount > 0 ? nonFeaturedArticles.slice(0, missingCount) : [];

  const articlesToDisplay = [...topFeatured, ...complementaryArticles];

  return (
    <Section className="mb-3">
      <HomeTitle>Artigos e Publicações</HomeTitle>
      <div className="flex flex-col gap-2 mb-2 lg:flex-row lg:justify-center lg:gap-y-14 lg:flex-wrap">
        {articlesToDisplay.map(
          ({ id, Titulo, Resumo, Publicacao, Capa, documentId }, index) => {
            const bgColor = bgColors[index % bgColors.length];
            return (
              <ArticleCard
                key={id}
                id={documentId}
                title={Titulo}
                author={"Autor Teste"}
                date={Publicacao}
                coverImage={Capa.url}
                bgColor={bgColor}
              />
            );
          }
        )}
      </div>
      <div className="flex justify-center mt-6 md:mt-8">
        <Button
          asChild
          className={cn(
            `rounded-lg px-6 bg-k-olive-dark text-k-yellow-light hover:bg-k-olive-deep hover:text-k-yellow-light transition-colors text-sm font-medium shadow-sm`,
            `md:text-base md:px-8 py-2 md:py-3`,
            `lg:text-lg`
          )}
        >
          <Link href="/posts">Ver todos</Link>
        </Button>
      </div>
    </Section>
  );
}
