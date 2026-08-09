import { CrashLab } from "@/components/crash-lab";
import { canonicalRun, hasCanonicalRun } from "@/lib/canonical";
import { BOT_CHAIN, CONTRACTS } from "@/lib/network";

export default function Home() {
  return (
    <CrashLab
      network={BOT_CHAIN}
      contracts={CONTRACTS}
      canonicalRun={canonicalRun}
      canonicalRunReady={hasCanonicalRun()}
    />
  );
}
