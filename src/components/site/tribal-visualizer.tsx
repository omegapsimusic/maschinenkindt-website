"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePlayerVisualizer } from "./player-visualizer-context";

const BARS_PER_SIDE = 6;
const REST_HEIGHT = 4;
const TICK_MS = 150;
// How long the settled (static logo, flat bars) state holds before the
// whole widget closes — long enough to read as an intentional wind-down,
// short enough that it doesn't linger once playback has actually stopped.
const HIDE_DELAY_MS = 900;

// Floating "now playing" widget: appears on the track's first frame of
// playback, with bars growing from the tribal mark's left/right wingtips
// like a natural extension of the linework. Not a real audio analyzer
// (Spotify/SoundCloud embeds don't expose waveform data) — just a
// randomized loop that reads as alive while `playing` is true. On pause/
// stop the bars settle flat, then the whole widget closes back to its
// initial (hidden) state.
export function TribalVisualizer() {
  const { playing } = usePlayerVisualizer();
  const [visible, setVisible] = useState(false);
  const leftRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rightRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (playing) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      // Syncing to an external signal (shared playback state), not
      // component-local derived state — there's no way to fold this into
      // render since it must survive across the debounced hide-timeout too.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    } else {
      hideTimeoutRef.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
    }
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [playing]);

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
      {visible && (
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
