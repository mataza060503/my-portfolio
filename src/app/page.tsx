import Hero from "@/components/sections/Hero";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import dynamic from "next/dynamic";

const Playground = dynamic(() => import("@/components/sections/Playground"), {
  ssr: true,
  loading: () => <div className="py-24 sm:py-32" />,
});

export default function Home() {
  return (
    <main>
      <Hero />
      <Skills />
      <Projects />
      <Playground />
      <Contact />
    </main>
  );
}
