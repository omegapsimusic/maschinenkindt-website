"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const SESSION_KEY = "mk-intro-seen";

// First-visit-only intro: the tribal mark flares in then wipes away,
// gated on sessionStorage so repeat navigations within the same tab
// don't replay it.
export function Intro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    // Gating on a browser-only API (sessionStorage) that isn't available
    // during SSR — this can only be known after mount, so there's no way
    // to fold it into the initial render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-void"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[38vw] w-[38vw] max-h-64 max-w-64"
          >
            <Image
              src="/textures/hero-tribal.png"
              alt=""
              fill
              priority
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
