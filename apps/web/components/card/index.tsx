import Image from "next/image";
import { TypographyLarge } from "../typography/large";
import { TypographyMuted } from "../typography/small-muted";

type ArticleCardProps = {
  id: string;
  title: string;
  date: string;
  author: string;
};

const ArticleCard = ({ id, title, author, date }: ArticleCardProps) => {
  return (
    <div key={id} className="flex h-[140] gap-3">
      <Image
        className="rounded-3xl"
        src="https://api.slingacademy.com/public/sample-photos/1.jpeg"
        alt="alt imagem"
        width={151}
        height={140}
      />
      <div className="flex flex-col">
        <TypographyLarge className="mb-0.5">
          <li className="bold line-clamp-2">{title}</li>
        </TypographyLarge>
        <TypographyMuted>
          <li>{author}</li>
          <li className="text-[11px]">{date}</li>
        </TypographyMuted>
      </div>
    </div>
  );
};

export default ArticleCard;
