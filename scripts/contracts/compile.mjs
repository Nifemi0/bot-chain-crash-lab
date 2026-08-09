import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import solc from "solc";

const sourceNames = (await readdir("contracts")).filter((name) => name.endsWith(".sol"));
const sources = Object.fromEntries(
  await Promise.all(
    sourceNames.map(async (name) => [name, { content: await readFile(`contracts/${name}`, "utf8") }]),
  ),
);

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object", "metadata"] },
    },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((entry) => entry.severity === "error");
if (errors.length) throw new Error(errors.map((entry) => entry.formattedMessage).join("\n"));

await mkdir("contracts/artifacts", { recursive: true });
for (const [sourceName, contracts] of Object.entries(output.contracts)) {
  for (const [contractName, compiled] of Object.entries(contracts)) {
    if (!compiled.evm.bytecode.object) continue;
    const artifact = {
      contractName,
      sourceName,
      abi: compiled.abi,
      bytecode: `0x${compiled.evm.bytecode.object}`,
      deployedBytecode: `0x${compiled.evm.deployedBytecode.object}`,
      metadata: compiled.metadata,
      compiler: solc.version(),
      optimizer: { enabled: true, runs: 200 },
    };
    await writeFile(
      `contracts/artifacts/${contractName}.json`,
      `${JSON.stringify(artifact, null, 2)}\n`,
    );
    process.stdout.write(`compiled ${sourceName}:${contractName}\n`);
  }
}
