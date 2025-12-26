import Image from "next/image";
import Section from "../section";

const Banner = () => {
  return (
    <Section>
      <Image
        src="/imgs/baner_medium.png"
        width={318}
        height={510}
        alt="Imagem do baner"
      />
    </Section>
  );
};

export default Banner;
