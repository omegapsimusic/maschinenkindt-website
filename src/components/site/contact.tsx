"use client";

import { SOUNDCLOUD_URL } from "./soundcloud";
import { BookingForm } from "./booking-form";

const BOOKING_EMAIL = "booking@maschinenkindt.de";

export function Contact() {
  return (
    <section
      id="booking"
      className="relative overflow-hidden border-t border-[var(--hairline)] py-28 md:py-40"
    >
      <div aria-hidden className="u-hazard absolute inset-x-0 top-0 h-1.5 opacity-70" />

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
                { label: "Instagram", href: "#" },
                { label: "SoundCloud", href: SOUNDCLOUD_URL },
                { label: "Bandcamp", href: "#" },
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
      </div>
    </section>
  );
}
