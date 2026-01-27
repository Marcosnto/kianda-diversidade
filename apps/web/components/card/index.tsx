import Image from "next/image";
import { TypographyLarge } from "../typography/large";
import { TypographyMuted } from "../typography/small-muted";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

type ArticleCardProps = {
  id: string;
  title: string;
  date: string;
  author: string;
  coverImage: string;
  bgColor?: string;
  linkClassName?: string;
  imageSizeClassName?: string;
};

const ArticleCard = ({
  id,
  title,
  author,
  date,
  coverImage,
  bgColor,
  linkClassName,
  imageSizeClassName,
}: ArticleCardProps) => {
  return (
    <Link
      key={id}
      className={cn(
        "flex gap-3 w-full",
        "sm:w-auto sm:min-w-[280px] sm:max-w-[320px]",
        "md:min-w-[300px] md:flex-1 md:max-w-none",
        "lg:min-w-[350px] lg:max-w-[450px]",
        "xl:min-w-[400px] xl:max-w-[500px] xl:gap-4",
        "2xl:min-w-[450px] 2xl:max-w-[550px] 2xl:gap-5",
        linkClassName,
      )}
      href={`/posts/${id}`}
    >
      <div
        className={cn(
          "relative flex-shrink-0",
          "w-[120px] h-[100px]",
          "sm:w-[140px] sm:h-[120px]",
          "md:w-[151px] md:h-[140px]",
          "xl:w-[180px] xl:h-[160px]",
          "2xl:w-[200px] 2xl:h-[180px]",
          imageSizeClassName,
        )}
      >
        <Image
          className="rounded-3xl lg:rounded-b-2xl object-cover w-full h-full"
          src={`${process.env.API_BASE_URL}${coverImage}`}
          alt="alt imagem"
          fill
        />
      </div>
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
        <TypographyLarge className={cn("mb-0.5 xl:mb-1", bgColor && "lg:text-white")}>
          <span className="bold line-clamp-2">{title}</span>
        </TypographyLarge>
        <TypographyMuted className="flex flex-col">
          <span
            className={cn(
              "font-semibold text-xs sm:text-sm lg:text-xl",
              "xl:text-2xl",
              bgColor && "lg:text-white",
            )}
          >
            {author}
          </span>
          <span
            className={cn(
              "text-[10px] sm:text-[11px] lg:text-sm",
              "xl:text-base",
              bgColor && "lg:text-white/80",
            )}
          >
            {date}
          </span>
        </TypographyMuted>
      </div>
    </Link>
  );
};

export default ArticleCard;
