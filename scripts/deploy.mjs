import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const contractPath = resolve(root, "contracts", "mila.py");
const outPath = resolve(root, "deployments", "studionet.json");
const rpc = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
const commit = run("git", ["rev-parse", "HEAD"], { optional: true }).trim() || "unknown";

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
  } catch (error) {
    if (options.optional) return "";
    const stderr = error.stderr?.toString() || error.message;
    throw new Error(`${command} ${args.join(" ")} failed:\n${stderr}`);
  }
}

function extractHash(output) {
  const match = output.match(/0x[a-fA-F0-9]{64}/);
  if (!match) throw new Error(`Could not find deployment transaction hash in output:\n${output}`);
  return match[0];
}

function extractAddress(output) {
  const match = output.match(/0x[a-fA-F0-9]{40}/);
  if (!match) return "";
  return match[0];
}

if (!process.env.GENLAYER_PRIVATE_KEY && !process.env.GENLAYER_ACCOUNT) {
  throw new Error("Set GENLAYER_PRIVATE_KEY or configure a GenLayer CLI account before deploying.");
}

const source = readFileSync(contractPath, "utf8");
if (!source.includes("class Mila(gl.Contract):")) {
  throw new Error("contracts/mila.py is not the production Mila gl.Contract.");
}

const deployOutput = run("genlayer", ["deploy", "--contract", contractPath, "--rpc", rpc]);
const deploymentTx = extractHash(deployOutput);
const acceptedReceipt = run("genlayer", ["receipt", deploymentTx, "--status", "ACCEPTED", "--rpc", rpc, "--retries", "120", "--interval", "5000"]);
const finalizedReceipt = run("genlayer", ["receipt", deploymentTx, "--status", "FINALIZED", "--rpc", rpc, "--retries", "120", "--interval", "5000"], { optional: true });
const contractAddress = extractAddress(finalizedReceipt || acceptedReceipt || deployOutput);

if (!contractAddress) {
  throw new Error(`Deployment finalized/accepted but no contract address was detected.\n${acceptedReceipt}`);
}

mkdirSync(dirname(outPath), { recursive: true });
const metadata = {
  network: "studionet",
  rpc,
  contractAddress,
  deploymentTx,
  commit,
  deployedAt: new Date().toISOString(),
};
writeFileSync(outPath, `${JSON.stringify(metadata, null, 2)}\n`);

console.log(JSON.stringify(metadata, null, 2));
