"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sigil } from "./sigil";
import type { Release } from "@/app/api/discography/route";

const TYPE_LABEL: Record<Release["albumType"], string> = {
  album: "Album",
  compilation: "Compilation",
  single: "Single",
};

export function Music() {
  const [releases, setReleases] = useState<Release[] | null>(null);
  const [source, setSource] = useState<"spotify" | "mock" | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/discography")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: { releases: Release[]; source: "spotify" | "mock" }) => {
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
            <h2 className="font-display font-semibold text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] text-bone">
              Katalog der<br />
              <span className="text-ember/90">Maschinen</span>
            </h2>
          </div>
          <p className="max-w-sm font-mono text-xs leading-relaxed text-steel">
            QUELLE: {source === "mock" ? "FALLBACK (MOCK)" : source === "spotify" ? "SPOTIFY LIVE" : "…"}
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
          <span className="absolute bottom-0 left-0 right-0 flex translate-y-full items-center justify-center gap-2 bg-ember py-2.5 font-tech text-xs font-semibold uppercase tracking-[0.18em] text-void transition-transform duration-300 group-hover:translate-y-0">
            ▶ Auf Spotify hören
          </span>
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
    </motion.li>
  );
}
