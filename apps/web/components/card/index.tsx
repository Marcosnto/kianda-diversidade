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
	summary?: string | null;
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
	summary,
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
						"w-full h-[294px]",
						"sm:h-[362px]",
						"md:h-[320px]",
						"lg:h-[362px]",
						"xl:h-[380px]",
						"2xl:h-[300px]",
						imageSizeClassName,
					)}
				>
					{coverImage ? (
						<Image
							className="object-contain"
							src={coverImage}
							alt={title}
							fill
						/>
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
					"justify-center lg:justify-start",
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
				{summary && (
					<p
						className={cn(
							"mt-1 line-clamp-3 text-xs leading-5 text-k-olive-dark sm:text-sm sm:leading-6",
							bgColor && "lg:text-white/85",
						)}
					>
						{summary}
					</p>
				)}
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
				{/* Reserva o espaço das tags para manter os cards alinhados. */}
				{visibleTags.length === 0 && (
					<span aria-hidden="true" className="mt-2 hidden lg:block h-5" />
				)}
			</div>
		</article>
	);
};

export default ArticleCard;
