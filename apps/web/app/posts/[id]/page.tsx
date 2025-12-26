import { getArticleById } from "@/services/get-article-by-id";
import { getArticles } from "@/services/get-articles";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const data = await getArticles();

  if (!data) return [];

  return data.map((article) => ({
    id: String(article.id),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);

  return {
    title: article?.Titulo ?? "Artigo não encontrado",
    description: article?.Resumo,
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{article.Titulo}</h1>
      <p className="text-gray-500 mb-6">{article.Publicacao}</p>
      <div className="prose">{article.Conteudo}</div>
    </article>
  );
}
