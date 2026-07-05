"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePlayerVisualizer } from "./player-visualizer-context";

const BARS_PER_SIDE = 6;
const REST_HEIGHT = 4;
const TICK_MS = 150;

// Floating "now playing" widget: the tribal mark stays put once a track has
// played, with bars growing from its left/right wingtips like a natural
// extension of the linework. Not a real audio analyzer (Spotify/SoundCloud
// embeds don't expose waveform data) — just a randomized loop that reads as
// alive while `playing` is true, and settles flat on pause.
export function TribalVisualizer() {
  const { playing, everPlayed } = usePlayerVisualizer();
  const leftRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rightRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const allBars = () => [...leftRefs.current, ...rightRefs.current].filter(Boolean) as HTMLDivElement[];

    if (!playing) {
      allBars().forEach((el) => {
        el.style.height = `${REST_HEIGHT}px`;
      });
      return;
    }

    const tick = () => {
      allBars().forEach((el) => {
        const h = 6 + Math.random() * 30;
        el.style.height = `${h}px`;
      });
    };
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <AnimatePresence>
      {everPlayed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 z-[95] flex -translate-x-1/2 items-end gap-2 rounded-sm border border-[var(--hairline)] bg-[#0d1017]/95 px-4 py-3 backdrop-blur-sm"
        >
          <div className="flex items-end gap-[3px]" aria-hidden>
            {Array.from({ length: BARS_PER_SIDE }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  leftRefs.current[i] = el;
                }}
                className="w-[3px] rounded-full bg-[#e73a3a] transition-[height] duration-150 ease-out"
                style={{ height: REST_HEIGHT }}
              />
            ))}
          </div>

          <div className="relative h-10 w-10 shrink-0 sm:h-12 sm:w-12">
            <Image src="/textures/hero-tribal.png" alt="" fill className="object-contain" />
          </div>

          <div className="flex items-end gap-[3px]" aria-hidden>
            {Array.from({ length: BARS_PER_SIDE }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  rightRefs.current[i] = el;
                }}
                className="w-[3px] rounded-full bg-[#e73a3a] transition-[height] duration-150 ease-out"
                style={{ height: REST_HEIGHT }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
