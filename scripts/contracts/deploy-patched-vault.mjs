import { ContractFactory } from "ethers";
import { mkdir, writeFile } from "node:fs/promises";
import {
  CHAIN_ID,
  EXPLORER_URL,
  MOCK_BOT_ADDRESS,
  assertTestnet,
  loadEncryptedWallet,
  readArtifact,
} from "./lib.mjs";

await assertTestnet();
const [wallet, artifact] = await Promise.all([
  loadEncryptedWallet(),
  readArtifact("PatchedVault"),
]);
const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
const contract = await factory.deploy(MOCK_BOT_ADDRESS);
const receipt = await contract.deploymentTransaction().wait(1);
const address = await contract.getAddress();
const deployment = {
  product: "Crash Lab",
  contract: "PatchedVault",
  network: "BOT Chain Testnet",
  chainId: CHAIN_ID,
  contractAddress: address,
  assetAddress: MOCK_BOT_ADDRESS,
  transactionHash: receipt.hash,
  blockNumber: receipt.blockNumber,
  deployer: wallet.address,
  explorerUrl: `${EXPLORER_URL}/address/${address}`,
};
await mkdir("deployments/testnet", { recursive: true });
await writeFile(
  "deployments/testnet/patched-vault.json",
  `${JSON.stringify(deployment, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(deployment, null, 2)}\n`);
