import About from "@/pages/home/about";
import Articles from "@/pages/home/articles";
import Banner from "@/pages/home/banner";
import { KiandaCarousel } from "@/pages/home/how-kianda-act";

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
