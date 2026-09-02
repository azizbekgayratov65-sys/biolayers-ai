"use client";

import { useReducedMotion } from "../hooks/useReducedMotion";
import type { ReactNode } from "react";

export default function PageTransition({
  children,
}: {
  children: ReactNode;
}) {
  const reduceMotion = Boolean(useReducedMotion());

  const style = {
    opacity: reduceMotion ? 1 : 0,
    transform: reduceMotion ? "none" : "translateY(12px)",
    filter: reduceMotion ? "none" : "blur(8px)",
    transition: `opacity ${reduceMotion ? 0 : 0.55}s ease-out, transform ${reduceMotion ? 0 : 0.55}s ease-out, filter ${reduceMotion ? 0 : 0.55}s ease-out`,
  } as React.CSSProperties;

  return <div style={style} className="min-h-screen">{children}</div>;
}