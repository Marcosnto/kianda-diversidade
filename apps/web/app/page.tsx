import About from "@/components/home-page/about";
import Articles from "@/components/home-page/articles";
import Banner from "@/components/home-page/banner";
import { KiandaCarousel } from "@/components/home-page/how-kianda-act";

export default function Page() {
  return (
    <div className="flex flex-col">
      <Banner />
      <KiandaCarousel />
      <About />
      <Articles />
    </div>
  );
}
