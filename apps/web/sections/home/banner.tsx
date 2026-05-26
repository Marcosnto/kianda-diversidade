import Section from "@/components/section";
import Image from "next/image";

const Banner = () => {
  return (
    <Section className="px-0 2xl:px-0" mobilePadding="px-0">
      <div className="my-5 flex justify-center px-4 sm:px-6 xl:my-0 xl:px-0">
        <div className="relative aspect-[1430/2084] w-full overflow-hidden md:hidden">
          <Image
            src="/imgs/home_mobile.png"
            fill
            className="object-contain"
            alt="Kianda Diversidade"
            sizes="100vw"
            priority
          />
        </div>

        <div className="relative hidden aspect-[818/936] w-full max-w-[944px] overflow-hidden md:block xl:hidden">
          <Image
            src="/imgs/baner_medium.png"
            fill
            className="object-contain"
            alt="Kianda Diversidade"
            sizes="100vw"
            priority
          />
        </div>

        <div className="relative hidden h-[calc(100svh-9rem)] min-h-[620px] w-full overflow-hidden xl:block 2xl:min-h-[680px]">
          <Image
            src="/imgs/baner_full.png"
            fill
            className="object-cover object-top"
            alt="Kianda Diversidade"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </Section>
  );
};

export default Banner;
