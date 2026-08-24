import { readFileSync } from "node:fs";

const privateKey = process.env.GENLAYER_PRIVATE_KEY;
const rpcUrl = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com";
const contractPath = new URL("../contracts/mila.py", import.meta.url);
const source = readFileSync(contractPath, "utf8");

if (!privateKey) {
  console.error("GENLAYER_PRIVATE_KEY is required to deploy Mila.");
  process.exit(1);
}

console.log("Mila deploy preflight");
console.log(`RPC: ${rpcUrl}`);
console.log(`Contract bytes: ${source.length}`);
console.log("Use the GenLayer Studio or CLI deployment flow with contracts/mila.py, then set NEXT_PUBLIC_MILA_CONTRACT_ADDRESS.");
