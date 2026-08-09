import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Contract, Wallet, formatEther, parseEther } from "ethers";
import { PASSPORT_ADDRESS, assertTestnet, loadEncryptedWallet, provider, readArtifact } from "./lib.mjs";

await assertTestnet();
await mkdir(".secrets", { recursive: true });

let publisher;
let password;
try {
  const [keystore, storedPassword] = await Promise.all([
    readFile(".secrets/passport-publisher.json", "utf8"),
    readFile(".secrets/passport-publisher-password.txt", "utf8"),
  ]);
  password = storedPassword.trim();
  publisher = (await Wallet.fromEncryptedJson(keystore, password)).connect(provider());
} catch {
  publisher = Wallet.createRandom().connect(provider());
  password = Wallet.createRandom().privateKey.slice(2);
  const keystore = await publisher.encrypt(password);
  await writeFile(".secrets/passport-publisher.json", keystore, { mode: 0o600 });
  await writeFile(".secrets/passport-publisher-password.txt", `${password}\n`, { mode: 0o600 });
}

const owner = await loadEncryptedWallet();
const passportArtifact = await readArtifact("SimulationPassport");
const passport = new Contract(PASSPORT_ADDRESS, passportArtifact.abi, owner);
const transactions = [];

if (!(await passport.publishers(publisher.address))) {
  const transaction = await passport.setPublisher(publisher.address, true);
  const receipt = await transaction.wait(1);
  transactions.push({ action: "authorize", hash: receipt.hash, blockNumber: receipt.blockNumber });
}

let balance = await provider().getBalance(publisher.address);
if (balance < parseEther("0.2")) {
  const transaction = await owner.sendTransaction({ to: publisher.address, value: parseEther("0.25") });
  const receipt = await transaction.wait(1);
  transactions.push({ action: "fund", hash: receipt.hash, blockNumber: receipt.blockNumber });
  balance = await provider().getBalance(publisher.address);
}

const result = {
  network: "BOT Chain Testnet",
  chainId: 968,
  address: publisher.address,
  authorized: await passport.publishers(publisher.address),
  balanceBot: formatEther(balance),
  transactions,
};
await writeFile(
  "deployments/testnet/passport-publisher.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
