import type { Metadata } from "next";
import { CrashLab } from "@/components/crash-lab";
import { canonicalRun, robinhoodCanonicalRun, hasCanonicalRun } from "@/lib/canonical";
import { BOT_CHAIN, ROBINHOOD_CHAIN, CONTRACTS, ROBINHOOD_CONTRACTS } from "@/lib/network";

export const metadata: Metadata = {
  title: "Analyze a contract",
  description:
    "Run a live, read-only contract scan on BOT Chain Mainnet or Robinhood Chain Mainnet.",
};

export default function Analyzer() {
  return (
    <CrashLab
      network={BOT_CHAIN}
      contracts={CONTRACTS}
      networks={[BOT_CHAIN, ROBINHOOD_CHAIN]}
      networkContracts={[CONTRACTS, ROBINHOOD_CONTRACTS]}
      canonicalRun={canonicalRun}
      canonicalRunReady={hasCanonicalRun()}
      robinhoodRun={robinhoodCanonicalRun}
      robinhoodRunReady={hasCanonicalRun(robinhoodCanonicalRun)}
    />
  );
}
