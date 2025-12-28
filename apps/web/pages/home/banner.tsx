import Section from "@/components/section";
import Image from "next/image";

const Banner = () => {
  return (
    <Section>
      <div className=" flex justify-center mt-5 mb-5">
        <Image
          src="/imgs/baner_medium.png"
          width={348}
          height={510}
          alt="Imagem do baner"
        />
      </div>
    </Section>
  );
};

export default Banner;
