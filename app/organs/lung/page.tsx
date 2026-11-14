import type { Metadata } from "next";

import LungExplorer from "../../components/organs/lung/LungExplorer";

export const metadata: Metadata = {
  title: "Lung · Organ atlas",
  description:
    "An interactive living model of lung adenocarcinoma: airways, vessels, lymph nodes, tumour microenvironment and two years of treatment response.",
};

export default function LungPage() {
  return <LungExplorer />;
}
