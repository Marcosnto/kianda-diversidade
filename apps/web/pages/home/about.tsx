import HomeTitle from "@/components/home-title";
import Section from "@/components/section";
import Image from "next/image";

const About = () => {
  return (
    <Section className="bg-k-olive-light text-k-off-white" id="about">
      <HomeTitle>Sobre</HomeTitle>
      <section className="pb-10">
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
        <span className="flex justify-center mb-2 mt-2">
          <Image
            src="/imgs/about_full.svg"
            width={162}
            height={258}
            alt="alt"
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
