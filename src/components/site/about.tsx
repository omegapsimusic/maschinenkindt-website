"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sigil } from "./sigil";

export function About() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // Keep ScrollTrigger in step with Lenis' inertia scroll.
    type LenisLike = {
      on: (e: string, cb: () => void) => void;
      off: (e: string, cb: () => void) => void;
    };
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    const sync = () => ScrollTrigger.update();
    lenis?.on("scroll", sync);

    const ctx = gsap.context((self) => {
      const q = self.selector!;

      // Layered parallax — deeper elements travel further.
      gsap.to(q(".p-ghost"), {
        yPercent: -22,
        ease: "none",
        scrollTrigger: { trigger: root.current, scrub: 0.6 },
      });
      gsap.to(q(".p-sigil"), {
        yPercent: 30,
        rotate: 40,
        ease: "none",
        scrollTrigger: { trigger: root.current, scrub: 1 },
      });
      gsap.to(q(".p-grid"), {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: root.current, scrub: 0.8 },
      });
      gsap.to(q(".p-portrait"), {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: root.current, scrub: 0.7 },
      });

      // Text lines rise + fade in as the block enters.
      gsap.from(q(".p-line"), {
        yPercent: 120,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: q(".p-copy"), start: "top 78%" },
      });

      // Stats count-up feel via clip reveal.
      gsap.from(q(".p-stat"), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: q(".p-stats"), start: "top 85%" },
      });
    }, root);

    ScrollTrigger.refresh();

    return () => {
      lenis?.off("scroll", sync);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="uebertragung"
      className="relative isolate overflow-hidden border-t border-[var(--hairline)] py-28 md:py-40"
    >
      {/* parallax backdrop layers */}
      <div aria-hidden className="p-grid u-grid absolute inset-0 -z-20 opacity-40" />
      <div
        aria-hidden
        className="p-sigil pointer-events-none absolute -right-24 top-10 -z-10 h-[min(60vw,560px)] w-[min(60vw,560px)] text-ember/[0.06]"
      >
        <Sigil className="h-full w-full" strokeWidth={0.8} />
      </div>
      <span
        aria-hidden
        className="p-ghost font-display font-semibold pointer-events-none absolute -left-4 top-8 -z-10 select-none text-[22vw] leading-none text-bone/[0.03]"
      >
        Herkunft
      </span>

      {/* portrait — grayscale, faded into the void, sits behind the stat column */}
      <div
        aria-hidden
        className="p-portrait pointer-events-none absolute -right-6 top-0 -z-10 h-full w-[min(46vw,560px)] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_75%,transparent),linear-gradient(to_left,black_35%,transparent)] [mask-composite:intersect]"
      >
        <Image
          src="/photos/portrait.png"
          alt=""
          fill
          sizes="560px"
          className="object-cover object-top grayscale contrast-125 opacity-[0.14]"
        />
      </div>

      <div className="mx-auto grid max-w-[110rem] gap-16 px-5 md:grid-cols-12 md:px-14">
        <div className="p-copy md:col-span-7 md:col-start-1">
          <p className="u-label mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-ember" />
            Übertragung 01 — Herkunft
          </p>

          <h2 className="font-display font-semibold mb-10 text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] text-bone">
            <span className="block overflow-hidden">
              <span className="p-line block">Aus Stahl</span>
            </span>
            <span className="block overflow-hidden">
              <span className="p-line block text-ember/90">und Stille.</span>
            </span>
          </h2>

          <div className="max-w-xl space-y-6 font-tech text-base font-light leading-relaxed text-bone/75 md:text-lg">
            <div className="overflow-hidden">
              <p className="p-line">
                Maschinenkindt entsteht dort, wo der Beton den Puls verliert — in
                stillgelegten Hallen, unter Leuchtstoffröhren, im Nachhall der
                letzten Schicht. Kein Genre als Pose, sondern als Verfahren:
                Rhythmus als Werkzeug, Distortion als Sprache.
              </p>
            </div>
            <div className="overflow-hidden">
              <p className="p-line">
                Jede Veröffentlichung ist ein Protokoll. Kompromisslos in der
                Härte, präzise in der Konstruktion, okkult im Ton. Was bleibt,
                ist eine Liturgie für den Rave — geschrieben in Kickdrums,
                gelesen mit dem Körper.
              </p>
            </div>
          </div>
        </div>

        {/* stat column */}
        <dl className="p-stats flex flex-col gap-8 md:col-span-4 md:col-start-9 md:justify-center">
          {[
            ["07", "Jahre im Untergrund"],
            ["42", "Nächte pro Jahr"],
            ["06", "Veröffentlichungen"],
            ["∞", "Umdrehungen"],
          ].map(([n, label]) => (
            <div
              key={label}
              className="p-stat border-l border-[var(--hairline)] pl-5"
            >
              <dt className="font-display font-bold text-5xl leading-none text-bone md:text-6xl">
                {n}
              </dt>
              <dd className="u-label mt-2 text-[0.62rem] normal-case tracking-[0.22em]">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
