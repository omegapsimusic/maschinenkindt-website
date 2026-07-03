"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sigil } from "./sigil";

const SPEC = [
  ["EST.", "2019"],
  ["ORT", "BXL / BER"],
  ["KAT.", "MK-∞"],
  ["BPM", "150–180"],
];

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Lazy-attach the video source only once the hero is near the viewport.
  // Combined with preload="none" this keeps the initial load lean; the
  // poster carries the visual until the file is decoded.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const attach = () => {
      if (el.dataset.loaded) return;
      const src = el.dataset.src;
      if (!src) return;
      el.src = src;
      el.dataset.loaded = "1";
      el.load();
      el.play().catch(() => {
        /* autoplay may be blocked — poster remains, no error surfaced */
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          attach();
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      className="relative flex min-h-dvh items-center overflow-hidden"
    >
      {/* ── background video (lazy) ── */}
      <div className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          data-src="/videos/hero.mp4"
          poster="/hero-poster.svg"
          preload="none"
          muted
          loop
          playsInline
          autoPlay
          onPlaying={() => setVideoReady(true)}
          className={`h-full w-full object-cover transition-opacity duration-1000 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* poster fallback layer + cinematic treatment */}
        <div
          aria-hidden
          className={`absolute inset-0 bg-[url('/hero-poster.svg')] bg-cover bg-center transition-opacity duration-1000 ${
            videoReady ? "opacity-0" : "opacity-100"
          }`}
        />
        <div aria-hidden className="absolute inset-0 u-scanlines opacity-40" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/30 to-void"
        />
        <div aria-hidden className="absolute inset-0 u-vignette" />
      </div>

      {/* ghost sigil drifting behind the wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(78vw,720px)] w-[min(78vw,720px)] -translate-x-1/2 -translate-y-1/2 text-bone/[0.07] motion-safe:animate-[spin_90s_linear_infinite]"
      >
        <Sigil className="h-full w-full" strokeWidth={0.8} />
      </div>

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
          <span className="text-steel">//</span>
          Rituelle Maschinenmusik
          <span className="text-steel">//</span>
          Transmission aktiv
        </motion.p>

        <motion.h1
          variants={rise}
          className="font-display u-ember-glow max-w-[16ch] text-[clamp(3.2rem,13vw,12rem)] leading-[0.82] tracking-tight text-bone"
        >
          Maschinen&shy;kindt
        </motion.h1>

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
            className="inline-flex items-center justify-center gap-3 border border-bone/25 px-8 py-4 font-tech text-sm font-semibold uppercase tracking-[0.16em] text-bone transition-colors duration-200 hover:border-ember hover:text-ember"
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
