import Image from "next/image";
import {
  TypographyLarge,
  TypographyMuted,
} from "@/components/typography-types";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import formatDatePtBR from "@/utils/format-date";

type ArticleCardProps = {
  id: string;
  title: string;
  date: Date | string | null;
  author: string;
  authorId?: string | null;
  tags?: Array<{ name: string }>;
  coverImage?: string | null;
  bgColor?: string;
  linkClassName?: string;
  imageSizeClassName?: string;
};

const ArticleCard = ({
  id,
  title,
  author,
  authorId,
  date,
  tags = [],
  coverImage,
  bgColor,
  linkClassName,
  imageSizeClassName,
}: ArticleCardProps) => {
  const visibleTags = tags.slice(0, 3);

  return (
    <article
      className={cn(
        "flex gap-3 w-full min-w-0",
        "sm:gap-3",
        "lg:flex-col lg:gap-x-0",
        linkClassName,
      )}
    >
      <Link
        className="block shrink-0 lg:w-full"
        href={`/posts/${id}`}
        aria-label={`Abrir artigo ${title}`}
      >
        <div
          className={cn(
            "relative flex-shrink-0 overflow-hidden rounded-3xl bg-k-olive-light/20 lg:rounded-b-2xl",
            "w-[120px] h-[100px]",
            "sm:w-[140px] sm:h-[120px]",
            "md:w-[151px] md:h-[140px]",
            "lg:w-full lg:h-auto lg:aspect-video",
            imageSizeClassName,
          )}
        >
          {coverImage ? (
            <Image className="object-cover" src={coverImage} alt={title} fill />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-k-olive-dark/70 sm:text-sm">
              Kianda Diversidade
            </div>
          )}
        </div>
      </Link>
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0",
          "justify-center",
          "lg:p-4 lg:rounded-b-3xl",
          "xl:p-5",
          "2xl:p-6",
          bgColor && `${bgColor}`,
        )}
      >
        <Link href={`/posts/${id}`}>
          <TypographyLarge
            className={cn("mb-0.5 xl:mb-1", bgColor && "lg:text-white")}
          >
            <span className="bold line-clamp-2">{title}</span>
          </TypographyLarge>
        </Link>
        <TypographyMuted className="flex flex-col">
          <span
            className={cn(
              "bold text-xs sm:text-sm",
              bgColor && "lg:text-white",
            )}
          >
            Por:{" "}
            {authorId ? (
              <Link className="hover:underline" href={`/authors/${authorId}`}>
                {author}
              </Link>
            ) : (
              author
            )}
          </span>
          <span
            className={cn(
              "text-[10px] sm:text-[11px] lg:text-sm",
              bgColor && "lg:text-white/80",
            )}
          >
            {formatDatePtBR(date)}
          </span>
          {visibleTags.length > 0 && (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <span
                  key={tag.name}
                  className={cn(
                    "max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-medium leading-4",
                    "bg-k-olive-light/15 text-k-olive-dark",
                    "sm:text-[11px]",
                    bgColor && "lg:bg-white/15 lg:text-white",
                  )}
                >
                  {tag.name}
                </span>
              ))}
            </span>
          )}
        </TypographyMuted>
      </div>
    </article>
  );
};

export default ArticleCard;
