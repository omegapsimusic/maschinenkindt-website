"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const LINKS = [
  { href: "#uebertragung", label: "Biographie", index: "01" },
  { href: "#diskographie", label: "Diskographie", index: "02" },
  { href: "#live-set", label: "Live-Set", index: "03" },
  { href: "#tour", label: "Tour", index: "04" },
  { href: "#booking", label: "Booking", index: "05" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-60 transition-colors duration-500 ${
          scrolled
            ? "border-b border-[var(--hairline)] bg-[color-mix(in_oklch,var(--void)_82%,transparent)] backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-[110rem] items-center justify-between px-5 py-3.5 md:px-10">
          <a
            href="#top"
            className="shrink-0 opacity-90 transition-opacity hover:opacity-100"
          >
            <Image
              src="/logo/wordmark.png"
              alt="Maschinenkindt"
              width={1400}
              height={467}
              priority
              className="h-6 w-auto md:h-7"
            />
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group flex items-baseline gap-2 text-bone/80 transition-colors hover:text-bone"
                >
                  <span className="font-mono text-[0.6rem] text-ember">
                    {l.index}
                  </span>
                  <span
                    data-text={l.label}
                    className="u-glitch-hover font-tech text-sm uppercase tracking-[0.18em]"
                  >
                    {l.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü umschalten"
            aria-expanded={open}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-px w-6 bg-bone transition-transform duration-300 ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-bone transition-transform duration-300 ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </nav>

        {/* mobile drawer */}
        <motion.ul
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden border-t border-[var(--hairline)] bg-[color-mix(in_oklch,var(--void)_92%,transparent)] backdrop-blur-md md:hidden"
        >
          {LINKS.map((l) => (
            <li key={l.href} className="border-b border-[var(--hairline)]">
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-3 px-6 py-4 text-bone/85"
              >
                <span className="font-mono text-xs text-ember">{l.index}</span>
                <span className="font-tech text-base uppercase tracking-[0.16em]">
                  {l.label}
                </span>
              </a>
            </li>
          ))}
        </motion.ul>
      </motion.header>

      {/* HUD side rails — decorative machine labeling, desktop only */}
      <div className="pointer-events-none fixed inset-y-0 left-0 z-50 hidden w-10 items-center justify-center lg:flex">
        <span className="u-label rotate-180 [writing-mode:vertical-rl] text-[0.6rem]">
          MK · TRANSMISSION · 150–180 BPM · STATUS LIVE
        </span>
      </div>
      <div className="pointer-events-none fixed inset-y-0 right-0 z-50 hidden w-10 items-center justify-center lg:flex">
        <span className="u-label [writing-mode:vertical-rl] text-[0.6rem]">
          LAT 50.85 · LON 4.35 · SIG//OK · CAT MK-∞
        </span>
      </div>
    </>
  );
}
