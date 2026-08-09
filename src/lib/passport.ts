import { Contract, Wallet } from "ethers";
import { PASSPORT_ABI } from "@/lib/contracts";
import { CONTRACTS } from "@/lib/network";
import { getBotChainProvider } from "@/lib/rpc";
import { TOOL_VERSION, isDemoContract } from "@/lib/simulation";

export async function publishDynamicPassport(input: {
  simulationId: string;
  protocol: string;
  sourceHash: string;
  reportHash: string;
}) {
  if (process.env.PASSPORT_PUBLISH_ENABLED !== "true") {
    throw new Error("Dynamic Passport publishing is disabled for the public demo.");
  }
  if (!isDemoContract(input.protocol)) {
    throw new Error("Passport publishing is limited to the canonical demo vault.");
  }
  const privateKey = process.env.PASSPORT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Passport publisher is not configured.");
  }

  const signer = new Wallet(privateKey, getBotChainProvider());
  const contract = new Contract(CONTRACTS.passport, PASSPORT_ABI, signer);
  if (!(await contract.publishers(signer.address))) {
    throw new Error("Configured wallet is not an authorized Passport publisher.");
  }
  if (await contract.exists(input.simulationId)) {
    throw new Error("This simulation already has a Passport.");
  }

  const transaction = await contract.publish(
    input.simulationId,
    input.protocol,
    input.sourceHash,
    input.reportHash,
    2,
    TOOL_VERSION,
  );
  const receipt = await transaction.wait(1);
  return {
    transactionHash: receipt.hash as string,
    blockNumber: receipt.blockNumber as number,
    publisher: signer.address,
  };
}
