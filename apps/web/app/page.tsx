import About from "@/sections/home/about";
import Articles from "@/sections/home/articles";
import Banner from "@/sections/home/banner";
import KiandaCarousel from "@/sections/home/how-kianda-act";
import { ArticleCardSkeleton } from "@/components/article-card-skeleton";
import Section from "@/components/section";
import HomeTitle from "@/components/home-title";
import { Suspense } from "react";

export const revalidate = 15;

export default function Page() {
  return (
    <div className="flex flex-col">
      <Banner />
      <KiandaCarousel />
      <About />
      <Suspense fallback={<ArticlesFallback />}>
        <Articles />
      </Suspense>
    </div>
  );
}

function ArticlesFallback() {
  return (
    <Section className="mb-3">
      <HomeTitle>Artigos e Publicações</HomeTitle>
      <ArticleCardSkeleton
        className="mb-2 gap-4 md:gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-2 xl:gap-8 2xl:grid-cols-4 2xl:gap-8"
        count={4}
        itemClassName="lg:overflow-hidden"
      />
    </Section>
  );
}
