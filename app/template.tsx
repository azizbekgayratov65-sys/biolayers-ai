"use client";

import type { ReactNode } from "react";
import PageTransition from "./components/PageTransition";

export default function Template({
  children,
}: {
  children: ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}