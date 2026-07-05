"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Script from "next/script";
import { WipeReveal } from "./wipe-reveal";
import { usePlayerVisualizer } from "./player-visualizer-context";
import { TribalVisualizerOverlay } from "./tribal-visualizer";

const SOURCE_ID = "soundcloud";

// Profile URL (not a single track) — the widget below renders it as a
// compact, natively-clickable track list, so new SoundCloud uploads show up
// here automatically with no code change.
export const SOUNDCLOUD_URL = "https://soundcloud.com/maschinenkindt";

const ACCENT = "e73a3a";

// SoundCloud's Widget JS API (loaded globally as `window.SC`), used only to
// listen for play/pause — https://developers.soundcloud.com/docs/api/html5-widget
type SCWidget = {
  bind: (event: string, cb: (...args: unknown[]) => void) => void;
  pause: () => void;
};
declare global {
  interface Window {
    SC?: { Widget: ((el: HTMLIFrameElement) => SCWidget) & { Events: Record<string, string> } };
  }
}

export function SoundCloud() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { reportPlaying } = usePlayerVisualizer();

  const embedSrc = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    SOUNDCLOUD_URL
  )}&color=%23${ACCENT}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let attached = false;
    const tryAttach = () => {
      if (attached || !window.SC || !iframe) return;
      attached = true;
      clearInterval(poll);
      const widget = window.SC.Widget(iframe);
      const stop = () => widget.pause();
      widget.bind(window.SC.Widget.Events.PLAY, () => reportPlaying(SOURCE_ID, true, stop));
      widget.bind(window.SC.Widget.Events.PAUSE, () => reportPlaying(SOURCE_ID, false, stop));
      widget.bind(window.SC.Widget.Events.FINISH, () => reportPlaying(SOURCE_ID, false, stop));
    };

    iframe.addEventListener("load", tryAttach);
    // Covers the case where the SC widget API script finishes loading after
    // the iframe already fired its own load event.
    const poll = setInterval(tryAttach, 300);

    return () => {
      iframe.removeEventListener("load", tryAttach);
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <WipeReveal>
              <h2 className="font-display font-semibold text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] text-bone">
                Zuletzt <span className="text-[#e73a3a]">aufgezeichnet.</span>
              </h2>
            </WipeReveal>
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
          <TribalVisualizerOverlay id={SOURCE_ID} />
          <iframe
            ref={iframeRef}
            title="Maschinenkindt — SoundCloud Player"
            width="100%"
            height="300"
            allow="autoplay"
            className="block w-full grayscale-[15%]"
            src={embedSrc}
            loading="lazy"
          />
        </motion.div>
      </div>

      <Script src="https://w.soundcloud.com/player/api.js" strategy="afterInteractive" />
    </section>
  );
}
