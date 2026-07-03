"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const BOOKING_EMAIL = "booking@maschinenkindt.de";

export function Contact() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const org = String(form.get("org") ?? "");
    const date = String(form.get("date") ?? "");
    const message = String(form.get("message") ?? "");

    // No backend yet — compose a pre-filled booking mail. Swap for a real
    // POST to your API/CRM when you're ready.
    const subject = `Booking-Anfrage — ${name || "Maschinenkindt"}`;
    const body = [
      `Name / Act: ${name}`,
      `Veranstalter: ${org}`,
      `Wunschtermin: ${date}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field =
    "w-full border border-[var(--hairline)] bg-ash/60 px-4 py-3.5 font-tech text-bone placeholder:text-steel/70 transition-colors focus:border-ember focus:outline-none focus-visible:outline-none";

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
            Transmission 03 — Booking
          </p>
          <h2 className="font-display mb-8 text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] text-bone">
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
              {["Instagram", "SoundCloud", "Bandcamp"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="font-mono text-xs uppercase tracking-[0.2em] text-steel transition-colors hover:text-bone"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full min-h-[24rem] flex-col items-center justify-center border border-ember/40 bg-ember/5 p-10 text-center"
            >
              <p className="font-display text-3xl text-bone">
                Übertragung vorbereitet.
              </p>
              <p className="u-label mt-4 max-w-xs normal-case tracking-[0.18em]">
                Dein Mail-Programm hat die Anfrage geöffnet. Sende sie ab —
                Maschinenkindt empfängt.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-8 border border-bone/25 px-6 py-3 font-tech text-xs font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:border-ember hover:text-ember"
              >
                Neue Anfrage
              </button>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="u-label text-[0.58rem]">Name / Act</span>
                <input name="name" required className={field} placeholder="Dein Name" />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="u-label text-[0.58rem]">Veranstalter</span>
                <input name="org" className={field} placeholder="Club / Kollektiv" />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="u-label text-[0.58rem]">E-Mail</span>
                <input
                  name="email"
                  type="email"
                  required
                  className={field}
                  placeholder="du@domain.de"
                />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="u-label text-[0.58rem]">Wunschtermin</span>
                <input name="date" type="date" className={`${field} [color-scheme:dark]`} />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="u-label text-[0.58rem]">Nachricht</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className={`${field} resize-none`}
                  placeholder="Ort, Rahmen, Slot-Länge, Budget …"
                />
              </label>
              <button
                type="submit"
                className="u-clip sm:col-span-2 mt-2 inline-flex items-center justify-center gap-3 bg-ember px-8 py-4 font-tech text-sm font-semibold uppercase tracking-[0.16em] text-void transition-transform duration-200 hover:-translate-y-0.5"
              >
                Anfrage senden →
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
