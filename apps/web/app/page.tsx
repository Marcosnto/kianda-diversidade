import About from "@/sections/home/about";
import Articles from "@/sections/home/articles";
import Banner from "@/sections/home/banner";
import KiandaCarousel from "@/sections/home/how-kianda-act";

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
