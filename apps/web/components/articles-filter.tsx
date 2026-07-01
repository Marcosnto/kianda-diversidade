"use client";

import ArticleCard from "@/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Search, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

const LEGACY_ARTICLE_AUTHOR = "Kianda Diversidade";

type FilterArticle = {
  id: string;
  title: string;
  published_in: Date | string | null;
  cover_image: {
    url: string;
  } | null;
  tags: Array<{
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
};

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function updateSearchUrl(search: string) {
  const url = new URL(window.location.href);

  if (search) {
    url.searchParams.set("busca", search);
  } else {
    url.searchParams.delete("busca");
  }

  window.history.pushState(null, "", url);
}

export function ArticlesFilter({
  articles,
  initialSearch = "",
}: ArticlesFilterProps) {
  const [inputValue, setInputValue] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const normalizedSearch = normalizeSearchValue(search);

  useEffect(() => {
    const handlePopState = () => {
      const value =
        new URLSearchParams(window.location.search).get("busca")?.trim() ?? "";
      setInputValue(value);
      setSearch(value);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const filteredArticles = useMemo(() => {
    if (!normalizedSearch) return articles;

    return articles.filter((article) => {
      const searchableValues = [
        article.title,
        article.author?.name ?? LEGACY_ARTICLE_AUTHOR,
        ...article.tags.map((tag) => tag.name),
      ];

      return searchableValues.some((value) =>
        normalizeSearchValue(value).includes(normalizedSearch),
      );
    });
  }, [articles, normalizedSearch]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = inputValue.trim();
    setSearch(nextSearch);
    updateSearchUrl(nextSearch);
  };

  const clearSearch = () => {
    setInputValue("");
    setSearch("");
    updateSearchUrl("");
  };

  return (
    <>
      <form
        className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row"
        onSubmit={submitSearch}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-k-olive-dark/70"
          />
          <Input
            aria-label="Pesquisar artigos"
            className="h-12 rounded-lg border-k-olive-light bg-white pr-4 pl-11 text-base text-k-olive-deep shadow-none placeholder:text-k-olive-dark/60 focus-visible:border-k-olive-dark focus-visible:ring-k-olive-light/30"
            name="busca"
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Pesquisar por título, tag ou autor"
            type="search"
            value={inputValue}
          />
        </div>
        <div className="flex gap-2">
          <Button
            className="h-12 flex-1 rounded-lg bg-k-olive-dark px-6 text-k-yellow-light hover:bg-k-olive-deep sm:flex-none"
            type="submit"
          >
            <Search />
            Pesquisar
          </Button>
          {search && (
            <Button
              aria-label="Limpar pesquisa"
              className="size-12 rounded-lg border-k-olive-light bg-transparent text-k-olive-dark hover:bg-k-olive-light/10"
              onClick={clearSearch}
              size="icon"
              type="button"
              variant="outline"
            >
              <X />
            </Button>
          )}
        </div>
      </form>

      {search && (
        <p
          aria-live="polite"
          className="mt-5 text-sm text-k-olive-dark sm:text-base"
        >
          {filteredArticles.length === 1
            ? "1 artigo encontrado"
            : `${filteredArticles.length} artigos encontrados`}{" "}
          para <strong className="font-semibold">“{search}”</strong>.
        </p>
      )}

      {filteredArticles.length > 0 ? (
        <ul
          className={cn(
            "my-8 grid grid-cols-1 gap-6 sm:my-10 sm:gap-8",
            "md:grid-cols-1",
            "lg:grid-cols-3 lg:gap-10",
            "xl:gap-12",
            "2xl:gap-14",
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
