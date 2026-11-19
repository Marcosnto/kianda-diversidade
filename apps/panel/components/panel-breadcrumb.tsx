"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

type Crumb = { label: string; href?: string };

/**
 * Rotas conhecidas do painel e o caminho de navegação correspondente.
 * A última entrada é sempre a página atual (sem link).
 */
const ROUTES: { match: RegExp; crumbs: Crumb[] }[] = [
	{ match: /^\/panel$/, crumbs: [{ label: "Início", href: "/panel" }] },
	{
		match: /^\/panel\/account$/,
		crumbs: [{ label: "Início", href: "/panel" }, { label: "Minha conta" }],
	},
	{
		match: /^\/panel\/blog$/,
		crumbs: [{ label: "Início", href: "/panel" }, { label: "Artigos" }],
	},
	{
		match: /^\/panel\/blog\/create$/,
		crumbs: [
			{ label: "Início", href: "/panel" },
			{ label: "Artigos", href: "/panel/blog/articles" },
			{ label: "Escrever artigo" },
		],
	},
	{
		match: /^\/panel\/blog\/articles$/,
		crumbs: [
			{ label: "Início", href: "/panel" },
			{ label: "Artigos", href: "/panel/blog/articles" },
			{ label: "Lista de artigos" },
		],
	},
	{
		match: /^\/panel\/blog\/articles\/[^/]+\/edit$/,
		crumbs: [
			{ label: "Início", href: "/panel" },
			{ label: "Artigos", href: "/panel/blog/articles" },
			{ label: "Editar artigo" },
		],
	},
	{
		match: /^\/panel\/blog\/categories$/,
		crumbs: [
			{ label: "Início", href: "/panel" },
			{ label: "Artigos", href: "/panel/blog/articles" },
			{ label: "Gerenciar categorias" },
		],
	},
	{
		match: /^\/panel\/blog\/general-information\/contact-channels$/,
		crumbs: [
			{ label: "Início", href: "/panel" },
			{ label: "Canais para contato" },
		],
	},
	{
		match: /^\/panel\/therapeutic-contract$/,
		crumbs: [
			{ label: "Início", href: "/panel" },
			{ label: "Contrato terapêutico" },
		],
	},
	{
		match: /^\/panel\/admin\/users$/,
		crumbs: [{ label: "Início", href: "/panel" }, { label: "Usuários" }],
	},
];

function buildCrumbs(pathname: string): Crumb[] {
  const normalized = pathname.replace(/\/+$/, "") || "/panel";
  const route = ROUTES.find((entry) => entry.match.test(normalized));

  if (route) {
    return route.crumbs;
  }

  return [{ label: "Início", href: "/panel" }, { label: "Painel" }];
}

export function PanelBreadcrumb() {
  const pathname = usePathname();
  const crumbs = React.useMemo(
    () => buildCrumbs(pathname ?? "/panel"),
    [pathname],
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
						<React.Fragment key={`${crumb.label}-${index}`}>
							<BreadcrumbItem className="hidden md:inline-flex">
								{crumb.href ? (
									<BreadcrumbLink asChild>
										<Link href={crumb.href}>{crumb.label}</Link>
									</BreadcrumbLink>
								) : (
									<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
								)}
							</BreadcrumbItem>
							{!isLast && <BreadcrumbSeparator className="hidden md:block" />}
						</React.Fragment>
					);
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
