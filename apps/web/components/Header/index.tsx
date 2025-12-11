import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { ChevronRight, Circle, Menu } from "lucide-react";
import { TypographyMuted } from "../typography/small-muted";
import { TypographyLarge } from "../typography/large";
import Link from "next/link";

type OptionsTypes = {
  label: string;
  path: string;
  isPage: boolean;
};

const menuOptions: OptionsTypes[] = [
  { label: "Como atuamos", path: "howKiandaAct", isPage: false },
  // { label: "Cursos e aulas", path: "courses", isPage: false },
  { label: "Sobre", path: "about", isPage: false },
  { label: "Artigos e Publicações", path: "/posts", isPage: true },
  { label: "Contato", path: "contact", isPage: false },
];

export default function HeaderMenu() {
  return (
    <div className="h-16 bg-k-olive-light items-center justify-between flex pl-4 pr-4">
      <Image
        className="fill-k-bronze"
        src="/imgs/kianda_name.svg"
        alt="Kianda Logo"
        width={181}
        height={37}
      />
      <Sheet>
        <SheetTrigger>
          <Menu size={32} />
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
              {menuOptions.map((option) => (
                <div className="flex items-center gap-2">
                  <ChevronRight size={15} className="text-k-amber" />
                  <Link href={option.path} className="text-base">
                    {option.label}
                  </Link>
                </div>
              ))}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
