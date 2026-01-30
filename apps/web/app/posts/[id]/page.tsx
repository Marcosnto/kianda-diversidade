import { getArticleById } from "@/services/get-article-by-id";
import { getArticles } from "@/services/get-articles";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { cn } from "@workspace/ui/lib/utils";
import formatDatePtBR from "@/utils/format-date";

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

function processRichTextContent(html: string): string {
  // Converte oembed do YouTube em iframe
  return html.replace(
    /<figure class="media"><oembed url="https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"]+)"><\/oembed><\/figure>/g,
    '<figure class="media"><div class="aspect-video w-full"><iframe src="https://www.youtube.com/embed/$1" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded-lg"></iframe></div></figure>',
  );
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(id);
  console.log(article);
  if (!article) {
    notFound();
  }

  return (
    <article className="w-full min-w-0 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto pt-[88px] pb-6 sm:pt-28 sm:pb-8 lg:pt-32 lg:pb-12">
      <div
        className={cn(
          "flex flex-col gap-4 min-w-0",
          "sm:gap-6",
          "lg:flex-row lg:gap-8 lg:items-start",
        )}
      >
        <div className="flex flex-col min-w-0 lg:w-[30%] lg:flex-shrink-0">
          {article.Capa?.url && (
            <div className="relative w-full min-w-0 mb-3 aspect-[16/10] sm:aspect-[4/3] lg:aspect-square lg:mb-6 overflow-hidden">
              <Image
                src={`${process.env.API_BASE_URL}${article.Capa.url}`}
                alt={article.Titulo || "Imagem do artigo"}
                fill
                className="rounded-lg object-cover sm:rounded-xl"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 30vw"
              />
            </div>
          )}

          <h1 className="text-base font-bold mb-2 text-black leading-tight break-words sm:text-lg sm:mb-3 lg:text-2xl xl:text-3xl">
            {article.Titulo}
          </h1>

          <div className="flex flex-col gap-1 mb-4 sm:mb-0 min-w-0">
            <p className="text-xs font-semibold text-black break-words sm:text-sm lg:text-lg">
              Por: {article.Autor || "Autor Teste"}
            </p>
            <p className="text-[11px] text-black break-words sm:text-xs lg:text-base">
              {formatDatePtBR(article.Publicacao)}
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0 lg:w-[70%]">
          <div className="bg-k-olive-light rounded-lg p-4 text-white sm:rounded-xl sm:p-6 lg:p-8 xl:p-10 min-w-0 overflow-hidden">
            <div
              className={cn(
                "prose prose-invert max-w-none min-w-0",
                "max-h-[600px] sm:max-h-[700px] lg:max-h-[800px] xl:max-h-[900px]",
                "overflow-y-auto overflow-x-hidden",
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/40",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "text-base leading-[1.75] sm:text-lg sm:leading-[1.7] lg:text-xl lg:leading-[1.7] xl:text-xl xl:leading-[1.75]",
                "text-left lg:text-justify",
                "[&_p]:mb-4 sm:[&_p]:mb-5 lg:[&_p]:mb-6 [&_p:last-child]:mb-0",
                "[&_p]:text-left lg:[&_p]:text-justify",
                "[&_*]:text-white [&_*]:break-words",
                "[&_img]:max-w-full [&_img]:h-auto [&_img]:my-6 [&_img]:rounded-lg",
                "[&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:my-4 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:bg-black/20",
                "[&_code]:break-words [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-black/20",
                "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4",
                "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3",
                "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
                "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4 [&_ul]:space-y-2",
                "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4 [&_ol]:space-y-2",
                "[&_li]:leading-[1.75]",
                "[&_a]:underline [&_a]:hover:no-underline [&_a]:transition-all",
                "[&_blockquote]:border-l-4 [&_blockquote]:border-white/30 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic",
              )}
              dangerouslySetInnerHTML={{
                __html: processRichTextContent(article.Conteudo1) || "",
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
