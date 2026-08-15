import { ContractFactory, formatEther } from "ethers";
import {
  MAINNET,
  MAINNET_DEPLOYMENT_PATH,
  addressUrl,
  assertAffordable,
  assertMainnet,
  loadMainnetWallet,
  mainnetProvider,
  readArtifact,
  readJson,
  writeJson,
} from "./mainnet-lib.mjs";

await assertMainnet();
const wallet = await loadMainnetWallet();
const provider = mainnetProvider();
const feeData = await provider.getFeeData();
const gasPrice = feeData.gasPrice;
if (!gasPrice) throw new Error("BOT mainnet RPC did not return a gas price.");

const state = await readJson(MAINNET_DEPLOYMENT_PATH, {
  product: "Crash Lab",
  network: MAINNET.name,
  chainId: MAINNET.chainId,
  rpcUrl: MAINNET.rpcUrl,
  explorerUrl: MAINNET.explorerUrl,
  deployer: wallet.address,
  contracts: {},
  createdAt: new Date().toISOString(),
});

if (state.deployer.toLowerCase() !== wallet.address.toLowerCase()) {
  throw new Error("Existing mainnet deployment belongs to a different deployer.");
}

async function deployContract(key, artifactName, args = []) {
  const existing = state.contracts[key];
  if (existing?.address) {
    const code = await provider.getCode(existing.address);
    if (code === "0x") throw new Error(`Saved ${key} address has no mainnet bytecode.`);
    return existing.address;
  }

  const artifact = await readArtifact(artifactName);
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const unsigned = await factory.getDeployTransaction(...args);
  const estimatedGas = await provider.estimateGas({ ...unsigned, from: wallet.address });
  await assertAffordable(wallet, estimatedGas, gasPrice);

  const contract = await factory.deploy(...args, {
    gasLimit: estimatedGas * 12n / 10n,
    gasPrice,
  });
  const receipt = await contract.deploymentTransaction().wait(1);
  const address = await contract.getAddress();
  state.contracts[key] = {
    contract: artifactName,
    address,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    effectiveGasPriceWei: receipt.gasPrice.toString(),
    explorerUrl: addressUrl(address),
  };
  state.updatedAt = new Date().toISOString();
  await writeJson(MAINNET_DEPLOYMENT_PATH, state);
  return address;
}

const mockBot = await deployContract("mockBot", "MockBOT");
await deployContract("vulnerableVault", "VulnerableVault", [mockBot]);
await deployContract("patchedVault", "PatchedVault", [mockBot]);
await deployContract("passport", "SimulationPassport");

state.complete = true;
state.updatedAt = new Date().toISOString();
state.remainingBalanceBot = formatEther(await provider.getBalance(wallet.address));
await writeJson(MAINNET_DEPLOYMENT_PATH, state);
process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
