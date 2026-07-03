"use client";

import { motion } from "framer-motion";

// Swap for the real SoundCloud profile / playlist URL once it exists.
export const SOUNDCLOUD_URL = "https://soundcloud.com/maschinenkindt";

const ACCENT = "e73a3a";

export function SoundCloud() {
  const embedSrc = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    SOUNDCLOUD_URL
  )}&color=%23${ACCENT}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;

  return (
    <section
      id="live-set"
      className="relative overflow-hidden border-t border-[var(--hairline)] py-28 md:py-40"
    >
      <div aria-hidden className="u-hazard absolute inset-x-0 top-0 h-1.5 opacity-70" />

      <div className="mx-auto max-w-[110rem] px-5 md:px-14">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="u-label mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[#e73a3a]" />
              Transmission 03 — Live-Set
            </p>
            <h2 className="font-display font-semibold text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] text-bone">
              Zuletzt <span className="text-[#e73a3a]">aufgezeichnet.</span>
            </h2>
          </div>
          <p className="max-w-sm font-mono text-xs leading-relaxed text-steel">
            Rohes Signal, direkt vom Pult. Ohne Schnitt, ohne Kompromiss.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="u-clip relative border border-[var(--hairline)] bg-void p-1.5"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 border border-[#e73a3a]/15"
          />
          <iframe
            title="Maschinenkindt — SoundCloud Player"
            width="100%"
            height="420"
            allow="autoplay"
            className="block w-full grayscale-[15%]"
            src={embedSrc}
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}
