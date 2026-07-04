"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Hard-edged wipe instead of a soft fade/slide — an overflow-hidden mask
// with the content sliding out from behind it, so section headlines
// announce themselves sharply as they enter. (Deliberately avoids animating
// clip-path directly via whileInView: that combination never triggered in
// this framer-motion version — y/opacity is the animation path already
// proven reliable elsewhere in this app, e.g. music.tsx / soundcloud.tsx.)
export function WipeReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay, ease: [0.83, 0, 0.17, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
