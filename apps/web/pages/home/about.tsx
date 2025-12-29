import HomeTitle from "@/components/home-title";
import Section from "@/components/section";
import Image from "next/image";

const About = () => {
  return (
    <Section
      className="bg-k-olive-light text-k-off-white py-2 md:bg-transparent"
      id="about"
    >
      <HomeTitle borderColor="border-k-off-white md:border-black md:text-k-olive-dark">
        Sobre
      </HomeTitle>
      <section className="pb-10 text-justify md:bg-k-olive-light md:text-white md:rounded-xl md:p-4 md:text-xl">
        <p className="lg:area-text">
          A <b className="font-semibold">KIANDA</b> é uma empresa comprometida
          em tornar os ambientes empresariais e educacionais mais{" "}
          <b className="font-semibold">diversos, inclusivos e saudáveis.</b> Em
          um contexto de retrocessos nas políticas sociais, diversas
          instituições têm buscado implementar programas de equidade e inclusão
          para pessoas negras, indígenas, pessoas com deficiência e outros
          grupos minoritários. No entanto,{" "}
          <i>
            garantir o acesso nem sempre é suficiente para assegurar a
            permanência.
          </i>
        </p>
        <span className="relative flex self-center mb-2 mt-2 w-[162px] h-[258px] md:w-[245px] md:h-[435px]">
          <Image
            className="h-full object-fill"
            src="/imgs/about_full.svg"
            alt="alt"
            fill
          />
        </span>
        <p className="lg:area-text2">
          Por isso, a <b className="font-semibold">KIANDA</b> foi criada para
          oferecer serviços que garantam a permanência e o desenvolvimento
          desses grupos, promovendo cuidado, saúde mental e bem-estar. Nossos
          serviços incluem consultorias e treinamentos, eventos e workshops,
          atendimentos psicoterapêuticos e grupos terapêuticos, com foco em
          instituições públicas e privadas, além de profissionais de diferentes
          áreas do mercado de trabalho.
        </p>
      </section>
    </Section>
  );
};

export default About;
