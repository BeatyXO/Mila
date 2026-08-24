import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const deploymentPath = resolve(root, "deployments", "studionet.json");
const rpc = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
const address = process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS || readDeploymentAddress();

function readDeploymentAddress() {
  if (!existsSync(deploymentPath)) return "";
  return JSON.parse(readFileSync(deploymentPath, "utf8")).contractAddress || "";
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
assertIncludes("get_summary", summary, "mila.policy.v1");
assertIncludes("get_summary", summary, "mila.decision.v1");

console.log(JSON.stringify({ network: "studionet", rpc, contractAddress: address, summaryVerified: true }, null, 2));
