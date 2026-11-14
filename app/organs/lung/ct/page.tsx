import type { Metadata } from "next";

import CtArchive from "../../../components/organs/lung/ct/CtArchive";

export const metadata: Metadata = {
  title: "Lung CT archive · Organ atlas",
  description:
    "Thousands of real chest CT scans from public cancer imaging collections, streamed from the NCI Imaging Data Commons and rendered as living point clouds.",
};

export default function LungCtPage() {
  return <CtArchive />;
}
