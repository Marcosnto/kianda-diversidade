import About from "@/components/home-page/about";
import Articles from "@/components/home-page/articles";

export default function Page() {
  return (
    <div className="flex flex-col">
      <About />
      <Articles />
    </div>
  );
}
