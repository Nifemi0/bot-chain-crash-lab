import { CrashLab } from "@/components/crash-lab";
import { canonicalRun, robinhoodCanonicalRun, hasCanonicalRun } from "@/lib/canonical";
import { BOT_CHAIN, ROBINHOOD_CHAIN, CONTRACTS, ROBINHOOD_CONTRACTS } from "@/lib/network";

export default function Home() {
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
