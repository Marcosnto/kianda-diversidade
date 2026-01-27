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
  console.log(bgColor);
  return (
    <Link
      key={id}
      className={cn(`flex gap-3  w-[25ch] md:w-[55ch]`, linkClassName)}
      href={`/posts/${id}`}
    >
      <div
        className={cn(`relative min-w-[151px] h-[140px]`, imageSizeClassName)}
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
          "flex flex-col",
          "lg:p-4 lg:rounded-b-3xl",
          bgColor && `${bgColor}`,
        )}
      >
        <TypographyLarge className="mb-0.5 lg:text-white">
          <span className="bold line-clamp-2">{title}</span>
        </TypographyLarge>
        <TypographyMuted className="flex flex-col">
          <span className="font-semibold lg:text-xl lg:text-white">
            {author}
          </span>
          <span className="text-[11px] lg:text-sm lg:text-white/80">
            {date}
          </span>
        </TypographyMuted>
      </div>
    </Link>
  );
};

export default ArticleCard;
