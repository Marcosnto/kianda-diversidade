import Image from "next/image";
import Link from "next/link";
import SocialMediaIcon from "./social-media-icons";
import { JSXElementConstructor, ReactElement } from "react";
import { getSocialMediaInfos } from "./social-media-icons/infos";
import Section from "@/components/section";
import HomeTitle from "@/components/home-title";
import { getContactChannels } from "@workspace/db/contact-channels";

export default async function Footer() {
	const socialMediaInfos = getSocialMediaInfos(await getContactChannels());

	return (
		<Section mobilePadding="px-0" className="md:px-4" id="contact">
			<HomeTitle showDivider></HomeTitle>
			<div className="w-full mb-5 md:flex md:flex-row-reverse lg:justify-between">
				<div className="row-span-2 flex h-[254px] flex-col place-content-between bg-k-olive-medium pb-[61px] pl-[29px] pr-[18px] pt-[22px] md:mr-[36px] md:h-auto md:items-end md:justify-between md:bg-transparent md:p-0 md:pl-[1rem] text-k-yellow-light lg:mr-0 md:text-k-olive-deep-light">
					<div className="flex flex-col items-start gap-2 lg:items-start lg:gap-4 lg:pr-10 ">
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
									label={icon.label}
									icon={
										icon.icon as ReactElement<
											{ className?: string | undefined },
											| string
											| JSXElementConstructor<{
													className?: string | undefined;
											  }>
										>
									}
								/>
							))}
						</div>

						<p className="hidden flex-col items-center gap-7 font-medium lg:w-full xl:text-[30px] lg:hidden">
							contato@kiandadiversidade.com
						</p>
					</div>
					<div className="flex flex-col items-end text-[12px] font-normal md:text-[16px] xl:text-[21px]">
						<span className="">Salvador, BA</span>
						<hr className="h-[2px] w-7 border-none bg-k-cinnamon" />
						<span>contato@kiandadiversidade.com</span>
					</div>
				</div>
				<div className="px-4 md:px-0 md:flex md:flex-col-reverse w-full lg:w-127 xl:w-[58%]">
					{/* <div>
            <div className="mb-1 mt-[10px] flex justify-start text-[13px] font-normal text-black md:text-[16px] xl:text-xl">
              <h1>Receba nossos conteúdos por email:</h1>
            </div>
            <NewsletterForm />
          </div> */}
					<div className="mt-4 relative h-68.75 w-full md:flex md:h-92.75 2xl:h-112.5">
						<Image
							src="/imgs/footer_img-fullhd.png"
							alt=""
							fill
							className="h-full object-fill sm:object-cover"
						/>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center justify-center text-sm md:col-span-3">
				<HomeTitle
					showDivider
					className="hidden xl:flex"
					iconType="completeMoon"
				>
					2025
				</HomeTitle>
			</div>

			<div className="flex gap-3 md:col-span-3 justify-center mb-5">
				<Link href="/privacy-police">Política de Privicidade</Link>
				<Link href="/cookies-police">Política de Cookies</Link>
			</div>
		</Section>
	);
}
