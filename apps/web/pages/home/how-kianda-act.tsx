"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@workspace/ui/components/carousel";

import Image, { StaticImageData } from "next/image";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import Section from "@/components/section";
import HomeTitle from "@/components/home-title";

export type StaticCardType = {
  id?: string;
  title: string;
  summary: string;
  imageURL: string | StaticImageData;
  imageClassName?: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeigth?: number;
  //change this type to be mandatory
  backgroundColor: "greenDark" | "greenLight" | "cinnamon" | "orange";
};

const colorMap = {
  greenDark: "bg-k-olive-dark",
  greenLight: "bg-k-olive-light",
  cinnamon: "bg-k-cinnamon",
  orange: "bg-k-orange",
};

const cards: StaticCardType[] = [
  {
    id: "1",
    title: "Consultoria para</br>Empresas",
    summary:
      "Serviço desenvolvido para identificar as necessidades do cliente e fornecer recursos para ações de melhoria no clima organizacional, promovendo um ambiente de trabalho mais inclusivo, saudável e diverso.",
    imageURL: "/imgs/home_card_1.png",
    imageAlt: "Alt descricao 1",
    backgroundColor: "greenDark",
  },
  {
    id: "2",
    title: "Eventos e</br>Workshop",
    summary:
      "Encontros que visam promover um espaço de inclusão, conscientizar sobre equidade social e estimular a troca de experiências para criar ambientes que sejam mais diversos e desenvolvidos.",
    imageURL: "/imgs/home_card_2.png",
    imageAlt: "Alt descricao 2",
    backgroundColor: "greenLight",
  },
  {
    id: "3",
    title: "Acompanhamento</br>Psicoterapêutico",
    summary:
      "Auxílio individual nos processos mentais e emocionais, realizado por profissionais experientes em diversidade, com o objetivo de oferecer cuidado e acolhimento a diferentes grupos sociais.",
    imageURL: "/imgs/home_card_3.png",
    imageAlt: "Alt descricao 3",
    backgroundColor: "cinnamon",
  },
  {
    id: "4",
    title: "Grupos</br>Terapêuticos",
    summary:
      "Espaço coletivo para promoção da saúde mental, composto por um pequeno grupo de pessoas e um profissional facilitador, com o objetivo de compartilhar experiências e sentimentos comuns.",
    imageURL: "/imgs/home_card_4.png",
    imageAlt: "Alt descricao 4",
    backgroundColor: "orange",
  },
];

export function KiandaCarousel() {
  //TODO: try to use this lib from ui
  const plugin = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      stopOnFocusIn: true,
      jump: false,
      playOnInit: true,
    }),
  );

  return (
    <Section id="how-kianda-act" className="mb-5">
      <HomeTitle>Como Kianda Atua</HomeTitle>

      <div className="relative md:hidden">
        <Carousel
          className="w-full justify-self-center"
          plugins={[plugin.current]}
          opts={{ loop: true }}
        >
          <CarouselContent>
            {cards.map(
              ({
                title,
                imageClassName,
                imageWidth = 413,
                imageHeigth = 413,
                imageAlt,
                imageURL,
                id,
                summary,
                backgroundColor,
              }) => (
                <CarouselItem
                  key={id}
                  className="flex basis-full justify-center sm:basis-1/2"
                >
                  <div className="w-[321px] md:w-[350px] lg:w-[396px]">
                    <Image
                      className={`mb-[6px] h-[294px] rounded-[1.75rem] object-cover sm:h-[362px] md:mb-2 md:h-[320px] lg:mb-6 lg:h-[362px] ${imageClassName}`.trim()}
                      width={imageWidth}
                      height={imageHeigth}
                      alt={imageAlt}
                      src={imageURL}
                    />
                    <div
                      className={`${colorMap[backgroundColor]} h-[226px] rounded-[15px] text-center md:rounded-[15px] lg:h-[299px]`}
                    >
                      <h1
                        className="border-b-2 border-b-k_yellow_light pb-[12.5px] pt-[11.77px] text-[25px]/[25px] font-normal text-white md:text-[30px]/[35px] xl:text-[36.55px]"
                        dangerouslySetInnerHTML={{ __html: title }}
                      />
                      <p
                        className={`${colorMap[backgroundColor]} rounded-xl px-[15px] py-[7px] text-left text-[0.94rem] font-light text-white md:py-[18px] lg:text-[21.5px]`}
                      >
                        {summary}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ),
            )}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow" />
          <CarouselNext className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow" />
        </Carousel>
      </div>

      <div className="mb-[87.5px] hidden w-full md:grid md:grid-cols-2 md:gap-9 lg:gap-y-16 xl:grid-cols-2 xl:gap-x-12 2xl:grid-cols-4 2xl:gap-x-8">
        {cards.map((card) => (
          <div className="w-full max-w-[396px] justify-self-center" key={card.id}>
            <div className="relative h-[294px] sm:h-[362px] md:mb-2 md:h-[320px] lg:mb-6 lg:h-[362px] xl:h-[380px] 2xl:h-[362px]">
              <Image
                className="mb-[6px] rounded-[1.75rem] object-cover"
                fill
                alt={card.imageAlt}
                src={card.imageURL}
              />
            </div>
            <div
              className={`${colorMap[card.backgroundColor]} h-[226px] rounded-[15px] text-center md:rounded-[15px] lg:h-[299px] xl:h-[320px] 2xl:h-[299px]`}
            >
              <h1
                className="border-b-2 border-b-k_yellow_light pb-[12.5px] pt-[11.77px] text-[25px]/[25px] font-normal text-white md:text-[30px]/[35px] xl:text-[36.55px]"
                dangerouslySetInnerHTML={{ __html: card.title }}
              />
              <p
                className={`${colorMap[card.backgroundColor]} rounded-xl px-[15px] py-[7px] text-left text-[0.94rem] font-light text-white md:py-[18px] lg:text-[21.5px] xl:text-[22px]`}
              >
                {card.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
