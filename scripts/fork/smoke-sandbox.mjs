import { readFile } from "node:fs/promises";
import { Sandbox } from "@vercel/sandbox";

const fixture = process.argv[2];
if (!fixture) throw new Error("Pass a replay input JSON path.");
const sandbox = await Sandbox.create({ persistent: false, timeout: 240_000, resources: { vcpus: 1 } });
try {
  await sandbox.mkDir("/vercel/run");
  await sandbox.writeFiles([
    { path: "/vercel/run/replay.mjs", content: await readFile(new URL("./replay-erc4626.mjs", import.meta.url)) },
    { path: "/vercel/run/input.json", content: await readFile(fixture) },
  ]);
  const install = await sandbox.runCommand({ cmd: "npm", args: [
    "install", "--prefix", "/vercel/run", "--no-audit", "--no-fund", "ethers@6.17.0", "@foundry-rs/anvil@1.7.1",
  ] });
  if (install.exitCode !== 0) throw new Error(`Sandbox install failed: ${(await install.stderr()).slice(-500)}`);
  const run = await sandbox.runCommand({ cmd: "node", args: ["/vercel/run/replay.mjs", "/vercel/run/input.json"] });
  if (run.exitCode !== 0) {
    throw new Error(`Sandbox replay failed: ${(await run.stderr()).slice(-500)}`);
  }
  process.stdout.write(await run.stdout());
} finally {
  await sandbox.stop();
}
