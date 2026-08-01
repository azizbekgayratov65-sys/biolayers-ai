"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function PageTransition({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      exit={{
        opacity: 0,
        y: -12,
        filter: "blur(8px)",
      }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}