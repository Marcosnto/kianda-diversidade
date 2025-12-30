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
};

const ArticleCard = ({
  id,
  title,
  author,
  date,
  coverImage,
  bgColor = "bg-k-brown",
}: ArticleCardProps) => {
  console.log("bg", bgColor);
  return (
    <Link
      key={id}
      className={cn(
        `flex gap-3`,
        `lg:flex-col lg:overflow-hidden lg:w-[500px] lg:ml-[2%] lg:mr-[2%]`,
        `2xl:w-[500px] 2xl:mr-0 4xl:ml-0`
      )}
      href={`/posts/${id}`}
    >
      <div
        className={cn(
          `relative w-[151px] h-[140px]`,
          `md:w-[368px]`,
          `lg:w-full lg:h-[300px]`,
          `2xl:h-[450px]`
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
          "flex flex-col",
          "lg:p-4 lg:rounded-b-3xl",
          bgColor && `${bgColor}`
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
