import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { LegacyAnalyzerHashRedirect } from "@/components/legacy-analyzer-hash-redirect";

export const metadata: Metadata = {
  title: "Know what is deployed",
  description:
    "Understand a deployed contract through live bytecode, interface signals, and evidence-backed review before you interact.",
};

export default function Home() {
  return <><LegacyAnalyzerHashRedirect /><LandingPage /></>;
}
