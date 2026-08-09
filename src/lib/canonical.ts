import runJson from "@/data/canonical-run.json";
import type { CanonicalRun } from "@/lib/types";

export const canonicalRun = runJson as CanonicalRun;

export function hasCanonicalRun(run: CanonicalRun = canonicalRun) {
  return Boolean(
    run.generatedAt &&
      run.contracts.patchedVault &&
      run.attack.transactionHashes.length > 0 &&
      run.replay.invariantHeld &&
      run.passport.transactionHash,
  );
}
