"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sigil } from "./sigil";
import { WipeReveal } from "./wipe-reveal";
import { usePlayerVisualizer } from "./player-visualizer-context";
import { TribalVisualizerOverlay } from "./tribal-visualizer";
import { onSpotifyIframeApiReady, type SpotifyEmbedController } from "@/lib/spotify-iframe-api";
import type { Release } from "@/app/api/discography/route";

const TYPE_LABEL: Record<Release["albumType"], string> = {
  album: "Album",
  compilation: "Compilation",
  single: "Single",
};

export function Music() {
  const [releases, setReleases] = useState<Release[] | null>(null);
  const [source, setSource] = useState<"spotify" | "spotify-stale" | "mock" | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/discography")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: { releases: Release[]; source: "spotify" | "spotify-stale" | "mock" }) => {
        if (!alive) return;
        setReleases(data.releases);
        setSource(data.source);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      id="diskographie"
      className="relative overflow-hidden border-t border-[var(--hairline)] py-28 md:py-40"
    >
      <div className="mx-auto max-w-[110rem] px-5 md:px-14">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="u-label mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-ember" />
              Archiv 02 — Diskographie
            </p>
            <WipeReveal>
              <h2 className="font-display font-semibold text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] text-bone">
                Katalog der<br />
                <span className="text-ember/90">Maschinen</span>
              </h2>
            </WipeReveal>
          </div>
          <p className="max-w-sm font-mono text-xs leading-relaxed text-steel">
            QUELLE:{" "}
            {source === "mock"
              ? "FALLBACK (MOCK)"
              : source === "spotify-stale"
                ? "SPOTIFY (CACHE)"
                : source === "spotify"
                  ? "SPOTIFY LIVE"
                  : "…"}
            <br />
            Alle Tonträger von Maschinenkindt, chronologisch absteigend.
          </p>
        </div>

        {error ? (
          <div className="border border-ember/40 bg-ember/5 px-6 py-10 text-center">
            <p className="font-tech text-bone">
              Übertragung unterbrochen. Der Katalog konnte nicht geladen werden.
            </p>
            <p className="u-label mt-2">ERR // DISCOGRAPHY_FETCH</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-px border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-3">
            {(releases ?? Array.from({ length: 6 }).map(() => null)).map(
              (rel, i) => (
                <MusicCard key={rel?.id ?? i} release={rel} index={i} />
              )
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

function MusicCard({
  release,
  index,
}: {
  release: Release | null;
  index: number;
}) {
  const [playing, setPlaying] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const { reportPlaying } = usePlayerVisualizer();
  const sourceId = `spotify-${release?.id ?? index}`;

  // Report "stopped" if this card unmounts while it was the active source
  // (e.g. the list re-renders), so the shared state doesn't keep thinking
  // something is still playing after the controller is gone.
  useEffect(() => {
    return () => {
      if (stopRef.current) {
        reportPlaying(sourceId, false, stopRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!release) return;

    const controller = controllerRef.current;
    if (controller) {
      if (playing) controller.pause();
      else controller.play();
      return;
    }

    // First click: create the (invisible) embed and start playback
    // straight away — this is a genuine click handler, so Spotify's own
    // IFrame API honors it as a real play request, no visible player UI
    // required for a 30s preview.
    const container = embedRef.current;
    if (!container) return;
    onSpotifyIframeApiReady((api) => {
      if (controllerRef.current) return;
      api.createController(
        container,
        { uri: `spotify:album:${release.id}`, width: "300", height: "152" },
        (ctrl) => {
          controllerRef.current = ctrl;
          const stop = () => ctrl.pause();
          stopRef.current = stop;
          ctrl.addListener("playback_update", (ev) => {
            setPlaying(!ev.data.isPaused);
            reportPlaying(sourceId, !ev.data.isPaused, stop);
          });
          ctrl.play();
        }
      );
    });
  };

  // Skeleton state while the discography is loading.
  if (!release) {
    return (
      <li className="min-h-[19rem] animate-pulse bg-ash/60 p-6">
        <div className="mb-8 h-3 w-16 bg-bone/10" />
        <div className="aspect-square w-full bg-bone/[0.06]" />
        <div className="mt-5 h-5 w-2/3 bg-bone/10" />
      </li>
    );
  }

  const year = release.releaseDate.slice(0, 4);

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: (index % 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative bg-ash/60 p-6 transition-colors duration-300 hover:bg-panel"
    >
      <a
        href={release.spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col"
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.2em] text-ember">
            {release.catalog}
          </span>
          <span className="u-label text-[0.58rem]">
            {TYPE_LABEL[release.albumType]}
          </span>
        </div>

        {/* cover — placeholder sigil until real Spotify artwork is wired in */}
        <div className="relative aspect-square w-full overflow-hidden bg-void u-scanlines">
          {release.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={release.cover}
              alt={`Cover — ${release.name}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-bone/10 transition-colors duration-500 group-hover:text-ember/25">
              <Sigil
                className="h-3/4 w-3/4 transition-transform duration-[1200ms] group-hover:rotate-45"
                strokeWidth={1}
              />
            </div>
          )}

          <TribalVisualizerOverlay id={sourceId} />

          <span className="absolute bottom-0 left-0 right-0 flex translate-y-full items-center justify-center gap-2 bg-ember py-2.5 font-tech text-xs font-semibold uppercase tracking-[0.18em] text-void transition-transform duration-300 group-hover:translate-y-0">
            ▶ Auf Spotify hören
          </span>

          {/* inline play control — plays the real 30s Spotify preview
              directly, no visible player UI */}
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={playing ? "Pause" : "Vorschau abspielen"}
            aria-pressed={playing}
            className="absolute right-2 top-2 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-bone/25 bg-void/80 text-bone backdrop-blur-sm transition-colors hover:border-ember hover:text-ember"
          >
            <span className="font-tech text-sm leading-none">{playing ? "❚❚" : "▶"}</span>
          </button>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <h3 className="font-display font-semibold text-2xl leading-none text-bone transition-colors group-hover:text-ember">
            {release.name}
          </h3>
        </div>

        <dl className="mt-4 flex items-center gap-4 font-mono text-[0.68rem] text-steel">
          <span>{year}</span>
          <span className="text-bone/20">·</span>
          <span>
            {release.totalTracks} {release.totalTracks === 1 ? "Track" : "Tracks"}
          </span>
        </dl>
      </a>

      {/* real Spotify player, invisible but on-screen — only its audio and
          playback_update events are used, no visible UI. Positioning this
          far off-screen (e.g. left:-9999px) makes Chrome treat it as a
          "distant iframe" and defer loading it indefinitely, so it must
          stay within the actual viewport bounds; opacity+pointer-events
          hide it instead. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0">
        <div ref={embedRef} className="h-full w-full" />
      </div>
    </motion.li>
  );
}
