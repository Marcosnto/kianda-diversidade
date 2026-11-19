"use client";

import ArticleCard from "@/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

const LEGACY_ARTICLE_AUTHOR = "Kianda Diversidade";

type FilterArticle = {
	id: string;
	title: string;
	summary: string;
	published_in: Date | string | null;
	cover_image: {
		url: string;
	} | null;
	tags: Array<{
		name: string;
	}>;
	categories: Array<{
		id: number;
		name: string;
	}>;
	author: {
		id: string;
		name: string;
	} | null;
};

type ArticlesFilterProps = {
  articles: FilterArticle[];
  initialSearch?: string;
  initialCategory?: string;
};

const ALL_CATEGORIES = "todas";

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function updateSearchUrl(search: string, category: string) {
  const url = new URL(window.location.href);

  if (search) {
    url.searchParams.set("busca", search);
  } else {
    url.searchParams.delete("busca");
  }

  if (category && category !== ALL_CATEGORIES) {
    url.searchParams.set("categoria", category);
  } else {
    url.searchParams.delete("categoria");
  }

  window.history.pushState(null, "", url);
}

export function ArticlesFilter({
  articles,
  initialSearch = "",
  initialCategory = ALL_CATEGORIES,
}: ArticlesFilterProps) {
  const [inputValue, setInputValue] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const normalizedSearch = normalizeSearchValue(inputValue);

  // Categorias disponíveis, com contagem de artigos publicados.
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();

    for (const article of articles) {
      for (const item of article.categories) {
        counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
      .map(([name, count]) => ({ name, count }));
  }, [articles]);

  // Sincroniza a URL com a busca (instantânea) e a categoria.
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateSearchUrl(inputValue.trim(), category);
    }, 250);

    return () => clearTimeout(timeout);
  }, [inputValue, category]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setInputValue(params.get("busca")?.trim() ?? "");
      setCategory(params.get("categoria")?.trim() || ALL_CATEGORIES);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const filteredArticles = useMemo(() => {
    const byCategory =
      category && category !== ALL_CATEGORIES
        ? articles.filter((article) =>
            article.categories.some((item) => item.name === category),
          )
        : articles;

    if (!normalizedSearch) return byCategory;

    return byCategory.filter((article) => {
      const searchableValues = [
        article.title,
        article.author?.name ?? LEGACY_ARTICLE_AUTHOR,
        ...article.tags.map((tag) => tag.name),
      ];

      return searchableValues.some((value) =>
        normalizeSearchValue(value).includes(normalizedSearch),
      );
    });
  }, [articles, normalizedSearch, category]);

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
  };

  const clearFilters = () => {
    setInputValue("");
    setCategory(ALL_CATEGORIES);
  };

  const hasActiveFilters =
    inputValue.trim().length > 0 || category !== ALL_CATEGORIES;

  return (
		<>
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
				<div className="relative min-w-0 flex-1">
					<Search
						aria-hidden="true"
						className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-k-olive-dark/70"
					/>
					<Input
						aria-label="Pesquisar artigos"
						className="h-12 rounded-lg border-k-olive-light bg-white pr-11 pl-11 text-base text-k-olive-deep shadow-none placeholder:text-k-olive-dark/60 focus-visible:border-k-olive-dark focus-visible:ring-k-olive-light/30"
						name="busca"
						onChange={(event) => setInputValue(event.target.value)}
						placeholder="Pesquisar por título, tag ou autor"
						type="search"
						value={inputValue}
					/>
					{inputValue && (
						<button
							aria-label="Limpar pesquisa"
							className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-k-olive-dark/60 transition-colors hover:bg-k-olive-light/15 hover:text-k-olive-dark"
							onClick={() => setInputValue("")}
							type="button"
						>
							<X className="size-4" />
						</button>
					)}
				</div>

				{categoryOptions.length > 0 && (
					<div className="relative min-w-0 sm:w-60">
						<label className="sr-only" htmlFor="categoria">
							Filtrar por categoria
						</label>
						<select
							className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-k-olive-light bg-white pr-10 pl-11 text-base text-k-olive-deep shadow-none outline-none transition-colors hover:border-k-olive-dark/50 focus-visible:border-k-olive-dark focus-visible:ring-2 focus-visible:ring-k-olive-light/30"
							id="categoria"
							onChange={(event) => handleCategoryChange(event.target.value)}
							value={category}
						>
							<option value={ALL_CATEGORIES}>
								Todas as categorias ({articles.length})
							</option>
							{categoryOptions.map((option) => (
								<option key={option.name} value={option.name}>
									{option.name} ({option.count})
								</option>
							))}
						</select>
						<Filter
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-k-olive-dark/70"
						/>
						<ChevronDown
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-k-olive-dark/60"
						/>
					</div>
				)}

				{hasActiveFilters && (
					<Button
						className="h-12 rounded-lg border-k-olive-light bg-transparent px-4 text-k-olive-dark hover:bg-k-olive-light/10 sm:shrink-0"
						onClick={clearFilters}
						type="button"
						variant="outline"
					>
						<X />
						<span className="sm:hidden">Limpar filtros</span>
					</Button>
				)}
			</div>

			{hasActiveFilters && (
				<p
					aria-live="polite"
					className="mx-auto mt-5 w-full max-w-3xl text-sm text-k-olive-dark sm:text-base"
				>
					{filteredArticles.length === 1
						? "1 artigo encontrado"
						: `${filteredArticles.length} artigos encontrados`}
					{normalizedSearch && (
						<>
							{" "}
							para <strong className="font-semibold">“{inputValue.trim()}”</strong>
						</>
					)}
					{category !== ALL_CATEGORIES && (
						<>
							{" "}
							na categoria{" "}
							<strong className="font-semibold">{category}</strong>
						</>
					)}
					.
				</p>
			)}

			{filteredArticles.length > 0 ? (
				<ul
					className={cn(
						"my-8 grid grid-cols-1 gap-6 sm:my-10 sm:gap-8",
						"md:grid-cols-1",
						"lg:grid-cols-2 lg:gap-8",
						"xl:grid-cols-2 xl:gap-8",
						"2xl:grid-cols-4 2xl:gap-8",
					)}
				>
					{filteredArticles.map(
						({ id, title, published_in, cover_image, tags, author }) => (
							<li key={id} className="w-full">
								<ArticleCard
									id={id}
									title={title}
									author={author?.name ?? LEGACY_ARTICLE_AUTHOR}
									authorId={author?.id}
									date={published_in}
									tags={tags}
									coverImage={cover_image?.url}
									linkClassName="w-full"
								/>
							</li>
						),
					)}
				</ul>
			) : (
				<div className="py-20 text-center">
					<h1 className="text-2xl font-semibold text-k-olive-deep md:text-3xl">
						Nenhum artigo encontrado
					</h1>
					<p className="mt-3 text-base leading-7 text-k-olive-dark md:text-lg">
						Tente pesquisar por outro título, tag ou autor.
					</p>
					<Button
						className="mt-6 rounded-lg bg-k-olive-dark px-6 text-k-yellow-light hover:bg-k-olive-deep"
						onClick={clearSearch}
						type="button"
					>
						Limpar pesquisa
					</Button>
				</div>
			)}
		</>
	);
}
