"use client";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { ChevronRight, Menu } from "lucide-react";
import { TypographyLarge, TypographyMuted } from "@/components/typography";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";

type OptionsTypes = {
  label: string;
  path: string;
  isPage: boolean;
};

const menuOptions: OptionsTypes[] = [
  { label: "Inicio", path: "/", isPage: false },
  { label: "Como atuamos", path: "how-kianda-act", isPage: false },
  // { label: "Cursos e aulas", path: "courses", isPage: false },
  { label: "Sobre", path: "about", isPage: false },
  { label: "Artigos e Publicações", path: "/posts", isPage: true },
  { label: "Contato", path: "contact", isPage: false },
];

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  const filteredMenuOptions = menuOptions.filter(
    (option) => !(option.path === "/" && isHomePage),
  );

  const handleSectionClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (path === "/") {
      setIsOpen(false);
      router.push("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } else if (isHomePage) {
      setPendingScroll(path);
      setIsOpen(false);
    } else {
      setIsOpen(false);
      router.push(`/#${path}`);
    }
  };

  useEffect(() => {
    if (!isOpen && pendingScroll && isHomePage) {
      const scrollToSection = () => {
        const element = document.getElementById(pendingScroll);
        if (element) {
          const headerHeight = 71;
          const rect = element.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const offsetPosition = rect.top + scrollTop - headerHeight;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth",
          });
          setPendingScroll(null);
        } else {
          setTimeout(scrollToSection, 100);
        }
      };

      setTimeout(scrollToSection, 500);
    }
  }, [isOpen, pendingScroll, isHomePage]);

  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerHeight = 71;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 300);
    }
  }, [isHomePage, pathname]);

  return (
    <>
      <div
        className={cn(
          "h-[71px] items-center justify-between flex pl-4 pr-4 xl:hidden",
          isHomePage
            ? "bg-k-olive-deep"
            : "bg-k-olive-deep fixed top-0 left-0 right-0 z-40",
        )}
      >
        <Link href="/">
          <Image
            src="/imgs/kianda_name-1.svg"
            alt="Kianda Logo"
            width={181}
            height={37}
          />
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger>
            <Menu size={32} className="text-k-off-white" />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-center mb-10">
                <TypographyLarge className="text-k-brown">
                  Kianda Menu
                </TypographyLarge>
                <TypographyMuted>Escolha uma sessão</TypographyMuted>
              </SheetTitle>
              <SheetDescription className="flex flex-col gap-10">
                {filteredMenuOptions.map((option, index) => (
                  <span
                    className="flex items-center gap-2"
                    key={`${option.label}-${index}`}
                  >
                    <ChevronRight size={15} className="text-k-amber" />
                    {option.isPage ? (
                      <Link
                        href={option.path}
                        className="text-base cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        {option.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="text-base text-left cursor-pointer"
                        onClick={(e) => handleSectionClick(e, option.path)}
                      >
                        {option.label}
                      </button>
                    )}
                  </span>
                ))}
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <span>
        <nav
          className={cn(
            "hidden xl:flex w-full justify-center items-center pointer-events-auto select-none shadow-none p-4 z-40",
            isHomePage
              ? "absolute top-0 left-0 bg-k-olive-light/30"
              : "fixed top-0 left-0 bg-k-olive-dark",
          )}
        >
          <ul className="flex gap-5 md:gap-12 w-full justify-center text-2xl font-semibold text-white">
            {filteredMenuOptions.map((option, index) => (
              <li key={`${option.label}-overlay-${index}`}>
                {option.isPage ? (
                  <Link
                    href={option.path}
                    className="hover:text-k-amber transition-colors cursor-pointer"
                  >
                    {option.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSectionClick(e, option.path)}
                    className="hover:text-k-amber transition-colors cursor-pointer"
                  >
                    {option.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 px-3 py-3 rounded-lg text-k-off-white bg-k-olive-deep border border-k-brown hover:bg-k-amber transition-colors text-lg font-semibold shadow z-50"
          aria-label="Voltar ao topo"
        >
          ↑
        </Button>
      </span>
    </>
  );
}
