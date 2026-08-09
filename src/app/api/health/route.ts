import { getBotChainProvider } from "@/lib/rpc";
import { BOT_CHAIN, CONTRACTS } from "@/lib/network";
import { canonicalRun, hasCanonicalRun } from "@/lib/canonical";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [blockNumber, passportCode, vaultCode] = await Promise.all([
      getBotChainProvider().getBlockNumber(),
      getBotChainProvider().getCode(CONTRACTS.passport),
      getBotChainProvider().getCode(CONTRACTS.vulnerableVault),
    ]);
    const contractsLive = passportCode !== "0x" && vaultCode !== "0x";
    return Response.json({
      ok: contractsLive,
      network: BOT_CHAIN.name,
      chainId: BOT_CHAIN.chainId,
      blockNumber,
      contractsLive,
      canonicalRunReady: hasCanonicalRun(canonicalRun),
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Health check failed." },
      { status: 503 },
    );
  }
}
