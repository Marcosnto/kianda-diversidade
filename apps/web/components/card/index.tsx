import Image from "next/image";
import { TypographyLarge } from "../typography/large";
import { TypographyMuted } from "../typography/small-muted";
import Link from "next/link";

type ArticleCardProps = {
  id: string;
  title: string;
  date: string;
  author: string;
  coverImage: string;
};

const ArticleCard = ({
  id,
  title,
  author,
  date,
  coverImage,
}: ArticleCardProps) => {
  return (
    <Link key={id} className="flex gap-3" href={`/posts/${id}`}>
      <div className="relative w-[151px] h-[140px] md:w-[368px] md:h-[200px]">
        <Image
          className="rounded-3xl object-cover w-full h-full"
          src={`${process.env.API_BASE_URL}${coverImage}`}
          alt="alt imagem"
          fill
        />
      </div>
      <div className="flex flex-col">
        <TypographyLarge className="mb-0.5">
          <li className="bold line-clamp-2">{title}</li>
        </TypographyLarge>
        <TypographyMuted>
          <li>{author}</li>
          <li className="text-[11px]">{date}</li>
        </TypographyMuted>
      </div>
    </Link>
  );
};

export default ArticleCard;
