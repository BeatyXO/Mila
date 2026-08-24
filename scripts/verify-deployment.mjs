import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const deploymentPath = resolve(root, "deployments", "studionet.json");
const rpc = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
const deployment = readDeployment();
const address = process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS || deployment.contractAddress || "";

function readDeployment() {
  if (!existsSync(deploymentPath)) return {};
  return JSON.parse(readFileSync(deploymentPath, "utf8"));
}

function run(args) {
  return execFileSync("genlayer", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
}

function assertIncludes(label, output, expected) {
  if (!output.includes(expected)) {
    throw new Error(`${label} did not include ${expected}:\n${output}`);
  }
}

if (!address) {
  throw new Error("Set NEXT_PUBLIC_MILA_CONTRACT_ADDRESS or create deployments/studionet.json first.");
}

const summary = run(["call", address, "get_summary", "--rpc", rpc]);
for (const expected of ["mila.policy.v1", "mila.decision.v1", "admin", "epoch", "round_count", "entry_count", "badge_count"]) {
  assertIncludes("get_summary", summary, expected);
}

if (existsSync(deploymentPath)) {
  for (const key of ["network", "contractAddress", "deploymentTx", "commit", "deployedAt"]) {
    if (!deployment[key]) throw new Error(`deployments/studionet.json is missing ${key}`);
  }
  if (deployment.network !== "studionet") throw new Error(`Unexpected deployment network: ${deployment.network}`);
}

console.log(JSON.stringify({ network: "studionet", rpc, contractAddress: address, summaryVerified: true, metadataVerified: existsSync(deploymentPath) }, null, 2));
