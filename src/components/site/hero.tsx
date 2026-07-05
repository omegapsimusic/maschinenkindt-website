"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";

const SPEC = [
  ["EST.", "2019"],
  ["ORT", "BXL / BER"],
  ["KAT.", "MK-∞"],
  ["BPM", "150–180"],
];

export function Hero() {
  // Parallax driven by a plain scroll listener rather than framer-motion's
  // useScroll({ target }) — that hook, even when unused downstream, stalls
  // the stagger animation for every motion child in this tree (repro'd:
  // removing just this one hook call restores the intro animation).
  const scrollPx = useMotionValue(0);
  useEffect(() => {
    const onScroll = () => scrollPx.set(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollPx]);
  const wordmarkY = useTransform(scrollPx, [0, 800], [0, 160]);
  const wordmarkOpacity = useTransform(scrollPx, [0, 650], [1, 0]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  };
  const rise = {
    hidden: { y: 26, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      id="top"
      className="relative isolate flex min-h-dvh items-center overflow-hidden"
    >
      <h1 className="sr-only">Maschinenkindt</h1>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-[110rem] px-5 md:px-14"
      >
        <motion.p
          variants={rise}
          className="u-label mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-ember"
        >
          <span className="inline-block h-1.5 w-1.5 bg-ember motion-safe:animate-pulse" />
          Hardtechno
          <span className="text-steel">{"//"}</span>
          Rituelle Maschinenmusik
          <span className="text-steel">{"//"}</span>
          Transmission aktiv
        </motion.p>

        <motion.div
          variants={rise}
          style={{ y: wordmarkY, opacity: wordmarkOpacity }}
          className="w-full max-w-[92vw] sm:max-w-[42rem] md:max-w-[56rem] lg:max-w-[66rem]"
        >
          <Image
            src="/logo/hero-wordmark.png"
            alt="Maschinenkindt"
            width={3000}
            height={1000}
            priority
            className="h-auto w-full drop-shadow-[0_0_50px_rgba(255,60,23,0.35)]"
          />
        </motion.div>

        <motion.p
          variants={rise}
          className="mt-8 max-w-xl font-tech text-lg font-light leading-relaxed text-bone/75 md:text-xl"
        >
          Kompromisslose Klangapparatur aus Stahl, Rauch und Ritual. Betrieben
          bei 150 bis 180 Umdrehungen — bis der Raum kapituliert.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a
            href="#diskographie"
            className="u-clip group inline-flex items-center justify-center gap-3 bg-ember px-8 py-4 font-tech text-sm font-semibold uppercase tracking-[0.16em] text-void transition-transform duration-200 hover:-translate-y-0.5"
          >
            Diskographie
            <span className="transition-transform group-hover:translate-x-1">
              ↓
            </span>
          </a>
          <a
            href="#booking"
            data-text="Booking anfragen"
            className="u-glitch-hover inline-flex items-center justify-center gap-3 border border-bone/25 px-8 py-4 font-tech text-sm font-semibold uppercase tracking-[0.16em] text-bone transition-colors duration-200 hover:border-ember hover:text-ember"
          >
            Booking anfragen
          </a>
        </motion.div>

        {/* spec strip */}
        <motion.dl
          variants={rise}
          className="mt-16 grid max-w-2xl grid-cols-2 gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-4"
        >
          {SPEC.map(([k, v]) => (
            <div key={k} className="bg-void/70 px-4 py-3 backdrop-blur-sm">
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-steel">
                {k}
              </dt>
              <dd className="mt-1 font-tech text-base text-bone">{v}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="u-label text-[0.55rem]">Scrollen</span>
        <span className="h-10 w-px bg-gradient-to-b from-bone/60 to-transparent motion-safe:animate-pulse" />
      </motion.div>
    </section>
  );
}
