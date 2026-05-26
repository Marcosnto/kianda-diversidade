import HomeTitle from "@/components/home-title";
import Section from "@/components/section";
import { cn } from "@workspace/ui/lib/utils";
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
      <div className="md:bg-k-olive-light lg:rounded-2xl">
        <section
          className={cn(
            `pb-10 text-justify`,
            `md:text-white md:rounded-xl md:p-4 md:text-xl `,
            `lg:grid lg:grid-cols-[38%_62%] lg:[grid-template-areas:'figure_text'_'figure_text-2'_'figure_text-2'] lg:p-[70px] lg:text-2xl`,
            `2xl:justify-items-center 2xl:items-center 2xl:text-3xl`,
          )}
        >
          <p className="lg:[grid-area:text] lg:mb-8">
            A <b className="font-semibold">KIANDA</b> é uma empresa comprometida
            em tornar os ambientes empresariais e educacionais mais{" "}
            <b className="font-semibold">diversos, inclusivos e saudáveis.</b>{" "}
            Em um contexto de retrocessos nas políticas sociais, diversas
            instituições têm buscado implementar programas de equidade e
            inclusão para pessoas negras, indígenas, pessoas com deficiência e
            outros grupos minoritários. No entanto,{" "}
            <i>
              garantir o acesso nem sempre é suficiente para assegurar a
              permanência.
            </i>
          </p>
          <span
            className={cn(
              `relative flex self-center mb-2 mt-2 h-[258px] w-full`,
              `md:h-[435px]`,
              `lg:[grid-area:figure] lg:h-[483px]`,
              `2xl:h-[556px] 2xl:self-center`,
            ).trim()}
          >
            <Image
              className="h-full object-fill"
              src="/imgs/about_full.svg"
              alt="alt"
              fill
            />
          </span>
          <p className="lg:[grid-area:text-2]">
            Por isso, a <b className="font-semibold">KIANDA</b> foi criada para
            oferecer serviços que garantam a permanência e o desenvolvimento
            desses grupos, promovendo cuidado, saúde mental e bem-estar. Nossos
            serviços incluem consultorias e treinamentos, eventos e workshops,
            atendimentos psicoterapêuticos e grupos terapêuticos, com foco em
            instituições públicas e privadas, além de profissionais de
            diferentes áreas do mercado de trabalho.
          </p>
        </section>
      </div>
    </Section>
  );
};

export default About;
