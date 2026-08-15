import { getBotChainProvider } from "@/lib/rpc";
import { BOT_CHAIN, CONTRACTS } from "@/lib/network";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = performance.now();
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
      rpcUrl: BOT_CHAIN.rpcUrl,
      contractBytes: {
        passport: Math.max(0, (passportCode.length - 2) / 2),
        vulnerableVault: Math.max(0, (vaultCode.length - 2) / 2),
      },
      latencyMs: Math.round(performance.now() - startedAt),
      rpcHealthy: true,
      ai: {
        configured: Boolean(process.env.DEEPSEEK_API_KEY?.trim()),
        model: process.env.DEEPSEEK_MODEL?.trim() || null,
        baseUrlConfigured: process.env.DEEPSEEK_BASE_URL === "https://api.deepseek.com",
      },
      analysisMode: "live-read-only",
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Health check failed." },
      { status: 503 },
    );
  }
}
