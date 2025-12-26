import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "./newsletter-form/newsletter-form";
import SocialMediaIcon from "./social-media-icons";
import { JSXElementConstructor, ReactElement } from "react";
import { socialMediaInfos } from "./social-media-icons/infos";
import Section from "../section";

export default function Footer() {
  return (
    <Section mobilePadding="px-0" id="contact">
      <div className="w-full mb-5">
        <div className="row-span-2 flex h-[254px] flex-col place-content-between bg-k-olive-medium pb-[61px] pl-[29px] pr-[18px] pt-[22px] md:mr-[36px] md:h-auto md:items-end md:justify-between md:bg-transparent md:p-0 md:pl-[1rem] text-k-yellow-light lg:mr-0 lg:text-black">
          <div className="flex flex-col items-start gap-2 lg:items-start lg:gap-4 lg:pr-10 xl:items-center">
            <p className="text-[18px] font-medium md:text-[28px] xl:text-[36px]">
              Canais para contato
            </p>

            <div className="mb-[10px] w-[28ch] text-[12px] font-normal md:w-[34ch] md:text-[14px] xl:hidden">
              Não perca nenhuma novidade! Acompanhe nossas últimas notícias e
              postagens.
            </div>

            <div className="flex max-w-[16ch] flex-wrap gap-2 md:max-w-[27ch] lg:max-w-[36ch]">
              {socialMediaInfos.map((icon) => (
                <SocialMediaIcon
                  key={icon.key}
                  link={icon.link}
                  icon={
                    icon.icon as ReactElement<
                      any,
                      string | JSXElementConstructor<any>
                    >
                  }
                />
              ))}
            </div>

            <p className="hidden flex-col items-center gap-7 font-medium lg:flex lg:w-full xl:text-[30px]">
              contato@kiandadiversidade.com
            </p>
          </div>
          <div className="flex flex-col items-end text-[12px] font-normal md:text-[16px] xl:text-[21px]">
            <span className="">Salvador, BA</span>
            <hr className="h-[2px] w-7 border-none bg-k-cinnamon" />
            <span>contato@kiandadiversidade.com</span>
          </div>
        </div>
        <div className="px-4">
          <div className="mb-1 mt-[10px] flex justify-start text-[13px] font-normal text-black md:text-[16px] lg:text-[28px] xl:text-[36px]">
            <h1>Receba nossos conteúdos por email:</h1>
          </div>
          <NewsletterForm />
        </div>
        <div className="px-4 relative h-[275px] w-full md:flex md:h-[371px] ">
          <Image
            src="/imgs/footer_img-fullhd.png"
            alt=""
            fill
            className="h-full object-fill sm:object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-sm md:col-span-3">
        {/* <ItalicTitle
          className="hidden xl:flex"
          iconType="completeMoon"
          showDivider={true}
          italic={false}
        >
          2025
        </ItalicTitle> */}
        <div className="flex gap-3 md:col-span-3">
          <Link href="/privacy-police">Política de Privicidade</Link>
          <Link href="/cookies-police">Política de Cookies</Link>
        </div>
        <p>
          © Feito por{" "}
          <Link href="https://www.linkedin.com/in/marcosnto/" target="_blank">
            Marcos Neto
          </Link>
        </p>
      </div>
    </Section>
  );
}
