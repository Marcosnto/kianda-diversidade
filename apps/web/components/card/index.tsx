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
        "flex gap-3 w-full min-w-0",
        "sm:gap-3",
        "lg:flex-col lg:gap-x-0",
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
          "lg:w-full lg:h-auto lg:aspect-video",
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
        <TypographyLarge
          className={cn("mb-0.5 xl:mb-1", bgColor && "lg:text-white")}
        >
          <span className="bold line-clamp-2">{title}</span>
        </TypographyLarge>
        <TypographyMuted className="flex flex-col">
          <span
            className={cn(
              "bold text-xs sm:text-sm",
              bgColor && "lg:text-white",
            )}
          >
            {`Por: ${author}`}
          </span>
          <span
            className={cn(
              "text-[10px] sm:text-[11px] lg:text-sm",
              bgColor && "lg:text-white/80",
            )}
          >
            {formatDatePtBR(date)}
          </span>
        </TypographyMuted>
      </div>
    </Link>
  );
};

export default ArticleCard;
