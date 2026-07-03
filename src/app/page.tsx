import Image from "next/image";
import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Music } from "@/components/site/music";
import { SoundCloud } from "@/components/site/soundcloud";
import { GigGlobe } from "@/components/site/gig-globe";
import { Contact } from "@/components/site/contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Music />
        <SoundCloud />
        <GigGlobe />
        <Contact />
      </main>

      <footer className="border-t border-[var(--hairline)] px-5 py-10 md:px-14">
        <div className="mx-auto flex max-w-[110rem] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Image
            src="/logo/wordmark.png"
            alt="Maschinenkindt"
            width={1400}
            height={467}
            className="h-7 w-auto opacity-90"
          />
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-steel">
            © {new Date().getFullYear()} · Rituelle Maschinenmusik · CAT. MK-∞
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-steel">
            SIG // OK · 150–180 BPM
          </p>
        </div>
      </footer>
    </>
  );
}
