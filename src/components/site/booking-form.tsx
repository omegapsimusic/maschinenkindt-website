"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BOOKING_EMAIL = "booking@maschinenkindt.de";

type FormState = {
  name: string;
  org: string;
  email: string;
  date: string;
  message: string;
};

const EMPTY: FormState = { name: "", org: "", email: "", date: "", message: "" };

type Step = {
  id: string;
  title: string;
  fields: (keyof FormState)[];
  isValid: (data: FormState) => boolean;
};

const STEPS: Step[] = [
  {
    id: "wer",
    title: "Wer ruft?",
    fields: ["name", "org"],
    isValid: (d) => d.name.trim().length > 0,
  },
  {
    id: "kontakt",
    title: "Erreichbarkeit",
    fields: ["email", "date"],
    isValid: (d) => /\S+@\S+\.\S+/.test(d.email),
  },
  {
    id: "botschaft",
    title: "Rahmen & Botschaft",
    fields: ["message"],
    isValid: (d) => d.message.trim().length > 0,
  },
];

const field =
  "w-full border border-[var(--hairline)] bg-ash/60 px-4 py-3.5 font-tech text-bone placeholder:text-steel/70 transition-colors focus:border-ember focus:outline-none focus-visible:outline-none";

const fieldInvalid = "border-ember/70";

export function BookingForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(EMPTY);
  const [attempted, setAttempted] = useState(false);
  const [sent, setSent] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const stepValid = current.isValid(data);

  function update(key: keyof FormState, value: string) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function goNext() {
    if (!stepValid) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    if (isLast) {
      submit();
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    setAttempted(false);
    setStep((s) => Math.max(0, s - 1));
  }

  function submit() {
    // No backend yet — compose a pre-filled booking mail. Swap for a real
    // POST to your API/CRM when you're ready.
    const subject = `Booking-Anfrage — ${data.name || "Maschinenkindt"}`;
    const body = [
      `Name / Act: ${data.name}`,
      `Veranstalter: ${data.org}`,
      `Wunschtermin: ${data.date}`,
      "",
      data.message,
    ].join("\n");

    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-full min-h-[24rem] flex-col items-center justify-center border border-ember/40 bg-ember/5 p-10 text-center"
      >
        <p className="font-display font-semibold text-3xl text-bone">
          Übertragung vorbereitet.
        </p>
        <p className="u-label mt-4 max-w-xs normal-case tracking-[0.18em]">
          Dein Mail-Programm hat die Anfrage geöffnet. Sende sie ab —
          Maschinenkindt empfängt.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setStep(0);
            setData(EMPTY);
          }}
          className="mt-8 border border-bone/25 px-6 py-3 font-tech text-xs font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:border-ember hover:text-ember"
        >
          Neue Anfrage
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* progress indicator */}
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className={`u-label transition-colors ${
                  i <= step ? "text-ember" : "text-steel/50"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`hidden font-tech text-xs uppercase tracking-[0.14em] transition-colors sm:inline ${
                  i === step ? "text-bone" : "text-steel/50"
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
        <div className="flex h-1 gap-1.5 bg-[var(--hairline)]">
          {STEPS.map((s, i) => (
            <div key={s.id} className="relative flex-1 overflow-hidden bg-ash/80">
              <motion.div
                className="absolute inset-y-0 left-0 bg-ember"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        onKeyDown={(e) => {
          if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            goNext();
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {current.id === "wer" && (
              <>
                <label className="flex flex-col gap-2 sm:col-span-1">
                  <span className="u-label text-[0.58rem]">Name / Act</span>
                  <input
                    value={data.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={`${field} ${
                      attempted && !data.name.trim() ? fieldInvalid : ""
                    }`}
                    placeholder="Dein Name"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-1">
                  <span className="u-label text-[0.58rem]">Veranstalter</span>
                  <input
                    value={data.org}
                    onChange={(e) => update("org", e.target.value)}
                    className={field}
                    placeholder="Club / Kollektiv"
                  />
                </label>
              </>
            )}

            {current.id === "kontakt" && (
              <>
                <label className="flex flex-col gap-2 sm:col-span-1">
                  <span className="u-label text-[0.58rem]">E-Mail</span>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={`${field} ${
                      attempted && !/\S+@\S+\.\S+/.test(data.email)
                        ? fieldInvalid
                        : ""
                    }`}
                    placeholder="du@domain.de"
                    autoFocus
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-1">
                  <span className="u-label text-[0.58rem]">Wunschtermin</span>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={`${field} [color-scheme:dark]`}
                  />
                </label>
              </>
            )}

            {current.id === "botschaft" && (
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="u-label text-[0.58rem]">Nachricht</span>
                <textarea
                  value={data.message}
                  onChange={(e) => update("message", e.target.value)}
                  rows={7}
                  className={`${field} resize-none ${
                    attempted && !data.message.trim() ? fieldInvalid : ""
                  }`}
                  placeholder="Ort, Rahmen, Slot-Länge, Budget …"
                  autoFocus
                />
              </label>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="font-tech text-sm font-semibold uppercase tracking-[0.16em] text-bone/70 transition-colors hover:text-ember disabled:pointer-events-none disabled:opacity-0"
          >
            ← Zurück
          </button>
          <button
            type="button"
            onClick={goNext}
            className="u-clip inline-flex items-center justify-center gap-3 bg-ember px-8 py-4 font-tech text-sm font-semibold uppercase tracking-[0.16em] text-void transition-transform duration-200 hover:-translate-y-0.5"
          >
            {isLast ? "Anfrage senden →" : "Weiter →"}
          </button>
        </div>
      </div>
    </div>
  );
}
