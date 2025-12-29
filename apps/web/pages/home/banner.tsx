import Section from "@/components/section";
import Image from "next/image";

const Banner = () => {
  return (
    <Section className="xl:p-0">
      <div className=" flex justify-center my-5 sm:h-[836px] sm:max-w-[600px] md:h-[936px] md:max-w-full xl:m-0">
        <div className="relative w-full h-auto aspect-[348/510]">
          <Image
            src="/imgs/baner_medium.png"
            fill
            className="object-cover"
            alt="Imagem do baner"
            sizes="100vw"
          />
        </div>
      </div>
    </Section>
  );
};

export default Banner;
