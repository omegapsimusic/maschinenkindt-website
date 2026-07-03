"use client";

import Image from "next/image";
import { SOUNDCLOUD_URL } from "./soundcloud";
import { BookingForm } from "./booking-form";

const BOOKING_EMAIL = "booking@maschinenkindt.de";

// Live-Archiv — Gig-Fotos. Neue Aufnahmen einfach oben ergaenzen; leere
// Slots werden bis GALLERY_SLOTS automatisch als Platzhalter aufgefuellt.
const GIG_PHOTOS = ["/photos/gigs/gig-01.jpg", "/photos/gigs/gig-02.jpg"];
const GALLERY_SLOTS = 6;

export function Contact() {
  return (
    <section
      id="booking"
      className="relative overflow-hidden border-t border-[var(--hairline)] py-28 md:py-40"
    >
      <div aria-hidden className="u-hazard absolute inset-x-0 top-0 h-1.5 opacity-70" />

      {/* tribal signet — faint watermark, masked from the raster asset so it can be tinted */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-[24rem] w-[46rem] max-w-[70vw] opacity-[0.05]"
        style={{
          backgroundColor: "var(--bone)",
          WebkitMaskImage: "url(/logo/tribal-signet.png)",
          maskImage: "url(/logo/tribal-signet.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />

      <div className="mx-auto grid max-w-[110rem] gap-16 px-5 md:grid-cols-12 md:px-14">
        <div className="md:col-span-5">
          <p className="u-label mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-ember" />
            Transmission 05 — Booking
          </p>
          <h2 className="font-display font-semibold mb-8 text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] text-bone">
            Ruf die<br />
            <span className="text-ember/90">Maschine.</span>
          </h2>
          <p className="mb-10 max-w-md font-tech text-base font-light leading-relaxed text-bone/75">
            Für Bookings, Kollaborationen und Presse. Sende die Koordinaten
            deiner Nacht — Datum, Ort, Rahmen. Es wird geantwortet.
          </p>

          <div className="space-y-4">
            <a
              href={`mailto:${BOOKING_EMAIL}`}
              className="group flex items-center gap-4 border-l border-ember pl-5"
            >
              <div>
                <p className="u-label text-[0.58rem]">Direkt</p>
                <p className="font-tech text-lg text-bone transition-colors group-hover:text-ember">
                  {BOOKING_EMAIL}
                </p>
              </div>
            </a>
            <div className="flex gap-8 pt-2">
              {[
                { label: "Instagram", href: "https://www.instagram.com/maschinenkindt/" },
                { label: "SoundCloud", href: SOUNDCLOUD_URL },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="font-mono text-xs uppercase tracking-[0.2em] text-steel transition-colors hover:text-bone"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <BookingForm />
        </div>

        <div className="md:col-span-12">
          <p className="u-label mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-ember" />
            Archivmaterial — Live
          </p>
          <div className="flex gap-px overflow-x-auto bg-[var(--hairline)]">
            {GIG_PHOTOS.map((src) => (
              <div
                key={src}
                className="group relative aspect-[3/4] w-40 shrink-0 overflow-hidden bg-ash sm:w-52"
              >
                <Image
                  src={src}
                  alt="Maschinenkindt live"
                  fill
                  sizes="(min-width: 640px) 13rem, 10rem"
                  className="object-cover grayscale contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
              </div>
            ))}
            {Array.from({ length: Math.max(0, GALLERY_SLOTS - GIG_PHOTOS.length) }).map(
              (_, i) => (
                <div
                  key={`slot-${i}`}
                  className="flex aspect-[3/4] w-40 shrink-0 items-center justify-center border border-dashed border-[var(--hairline)] bg-ash/30 sm:w-52"
                >
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-steel/40">
                    MK // TBA
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
