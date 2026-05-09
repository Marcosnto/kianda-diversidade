import ArticleCard from "@/components/card";
import HomeTitle from "@/components/home-title";
import Section from "@/components/section";
import { getArticles } from "@workspace/api";
import { getAuthorFullName } from "@/utils/get-author-full-name";
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
      <div className="grid grid-cols-1 gap-4 mb-2 md:grid-cols-1 md:gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-2 xl:gap-8 2xl:grid-cols-4 2xl:gap-8">
        {articlesToDisplay.map(
          ({ id, Titulo, Publicacao, Capa, documentId, createdBy }, index) => {
            const bgColor = bgColors[index % bgColors.length];
            return (
              <ArticleCard
                key={id}
                id={documentId}
                title={Titulo}
                author={getAuthorFullName(createdBy)}
                date={Publicacao}
                coverImage={Capa?.url}
                bgColor={bgColor}
                linkClassName="lg:flex-col lg:overflow-hidden w-full max-w-full"
                imageSizeClassName="md:w-[350px] md:h-[250px] lg:w-full lg:h-[300px] xl:w-full xl:h-[350px] 2xl:w-full 2xl:h-[400px]"
              />
            );
          },
        )}
      </div>
      <div className="flex justify-center mt-6 md:mt-8">
        <Button
          asChild
          className={cn(
            `rounded-lg px-6 bg-k-olive-dark text-k-yellow-light hover:bg-k-olive-deep hover:text-k-yellow-light transition-colors text-sm font-medium shadow-sm`,
            `md:text-base md:px-8 py-2 md:py-3`,
            `lg:text-lg`,
          )}
        >
          <Link href="/posts">Ver todos</Link>
        </Button>
      </div>
    </Section>
  );
}
