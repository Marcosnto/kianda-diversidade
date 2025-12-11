import ArticleCard from "@/components/card";
import HomeTitle from "@/components/home-title";
import Section from "@/components/section";

export default async function Articles() {
  const data = await fetch("https://api.vercel.app/blog");
  const posts = await data.json();
  const example = posts.slice(0, 3);
  return (
    <Section className="mb-3">
      <HomeTitle>Artigos e Publicações</HomeTitle>
      <ul className="flex flex-col gap-2">
        {example.map(
          ({
            id,
            title,
            author,
            date,
          }: {
            id: string;
            title: string;
            author: string;
            date: string;
          }) => (
            <ArticleCard
              key={id}
              id={id}
              title={title}
              author={author}
              date={date}
            />
          )
        )}
      </ul>
    </Section>
  );
}
