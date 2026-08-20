"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function PageTransition({
  children,
}: {
  children: ReactNode;
}) {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 18,
              filter: "blur(10px)",
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      exit={
        reduceMotion
          ? undefined
          : {
              opacity: 0,
              y: -12,
              filter: "blur(8px)",
            }
      }
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}