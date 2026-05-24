export type ArticleStatus = "published" | "draft";

export function getArticleStatus(article: {
  published_in: Date | string | null;
}): ArticleStatus {
  if (!article.published_in) return "draft";
  return new Date(article.published_in) <= new Date() ? "published" : "draft";
}
