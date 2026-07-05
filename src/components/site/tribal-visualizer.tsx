"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePlayerVisualizer } from "./player-visualizer-context";

const BARS_PER_SIDE = 5;
const REST_HEIGHT = 4;
const TICK_MS = 150;
// How long the settled (static logo, flat bars) state holds before the
// overlay fades out — long enough to read as an intentional wind-down.
const HIDE_DELAY_MS = 600;

// Solid black stroke around the bars/logo so they read against a cover of
// any brightness — built from 8 offset zero-blur drop-shadows (a duplicated
// silhouette in every direction), not a single soft shadow, so it reads as
// a hard outline rather than a glow.
const BLACK_STROKE = [-1.5, 0, 1.5].flatMap((dx) =>
  [-1.5, 0, 1.5]
    .filter((dy) => dx !== 0 || dy !== 0)
    .map((dy) => `drop-shadow(${dx}px ${dy}px 0 rgba(0,0,0,0.95))`)
).join(" ");

const LOGO_FILTER = `${BLACK_STROKE} drop-shadow(0 0 10px rgba(231,58,58,0.8)) drop-shadow(0 0 22px rgba(231,58,58,0.5))`;
const BAR_BOX_SHADOW =
  "0 0 0 1.5px rgba(0,0,0,0.95), 0 0 6px rgba(231,58,58,0.9), 0 0 14px rgba(231,58,58,0.5)";

// Transparent overlay meant to sit directly on top of whichever cover/player
// box is currently playing (place it inside a `position: relative`
// container). Bars grow from the tribal mark's left/right wingtips in
// randomized loop heights while playing — not a real audio analyzer, since
// Spotify/SoundCloud embeds don't expose waveform data — and settle flat,
// then fade the whole overlay out, once playback stops.
export function TribalVisualizerOverlay({ id }: { id: string }) {
  const { activeId, playing } = usePlayerVisualizer();
  const isPlayingHere = activeId === id && playing;

  const [visible, setVisible] = useState(false);
  const leftRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rightRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPlayingHere) {
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
  }, [isPlayingHere]);

  useEffect(() => {
    const allBars = () => [...leftRefs.current, ...rightRefs.current].filter(Boolean) as HTMLDivElement[];

    if (!isPlayingHere) {
      allBars().forEach((el) => {
        el.style.height = `${REST_HEIGHT}px`;
      });
      return;
    }

    const tick = () => {
      allBars().forEach((el) => {
        const h = 6 + Math.random() * 34;
        el.style.height = `${h}px`;
      });
    };
    tick();
    const iv = setInterval(tick, TICK_MS);
    return () => clearInterval(iv);
  }, [isPlayingHere]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
          {/* left bars — negative margin + lower z-index tucks their base
              behind the logo's wingtip so they read as growing out of it */}
          <div className="relative z-0 -mr-3 flex items-end gap-[3px]" aria-hidden>
            {Array.from({ length: BARS_PER_SIDE }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  leftRefs.current[i] = el;
                }}
                className="w-[3px] rounded-full bg-[#e73a3a] transition-[height] duration-150 ease-out"
                style={{ height: REST_HEIGHT, boxShadow: BAR_BOX_SHADOW }}
              />
            ))}
          </div>

          <div className="relative z-10 h-16 w-16 shrink-0">
            <Image
              src="/textures/hero-tribal.png"
              alt=""
              fill
              className="object-contain"
              style={{ filter: LOGO_FILTER }}
            />
          </div>

          <div className="relative z-0 -ml-3 flex items-end gap-[3px]" aria-hidden>
            {Array.from({ length: BARS_PER_SIDE }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  rightRefs.current[i] = el;
                }}
                className="w-[3px] rounded-full bg-[#e73a3a] transition-[height] duration-150 ease-out"
                style={{ height: REST_HEIGHT, boxShadow: BAR_BOX_SHADOW }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
