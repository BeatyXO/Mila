import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rpc = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
const deploymentPath = resolve(root, "deployments", "studionet.json");
const proofPath = resolve(root, "LIVE_PROOF.md");
const configuredAddress = process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS || readAddress();

function readAddress() {
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

function hash(output) {
  const match = output.match(/0x[a-fA-F0-9]{64}/);
  if (!match) throw new Error(`No tx hash found:\n${output}`);
  return match[0];
}

function wait(tx) {
  const receipt = run(["receipt", tx, "--status", "FINALIZED", "--rpc", rpc, "--retries", "120", "--interval", "5000"]);
  if (!/FINALIZED|ACCEPTED|FINISHED_WITH_RETURN|success/i.test(receipt)) {
    throw new Error(`Transaction did not finalize successfully:\n${receipt}`);
  }
  return receipt;
}

function write(address, method, args) {
  const tx = hash(run(["write", address, method, "--rpc", rpc, "--args", ...args.map(String)]));
  wait(tx);
  return tx;
}

function call(address, method, args = []) {
  return run(["call", address, method, "--rpc", rpc, "--args", ...args.map(String)]);
}

if (!configuredAddress) {
  console.log("StudioNet integration skipped: NEXT_PUBLIC_MILA_CONTRACT_ADDRESS or deployments/studionet.json is required.");
  process.exit(0);
}
if (!process.env.GENLAYER_PRIVATE_KEY && !process.env.GENLAYER_ACCOUNT) {
  console.log("StudioNet integration skipped: GENLAYER_PRIVATE_KEY or configured GenLayer account is required.");
  process.exit(0);
}

const nonce = Date.now();
const opens = Math.floor(Date.now() / 1000) - 60;
const closes = opens + 86400;

const createTx = write(configuredAddress, "create_round", [`Office lore ${nonce}`, `The group chat went quiet ${nonce}.`, opens, closes, 4, 140, 240]);
const summaryAfterRound = call(configuredAddress, "get_summary");
const roundMatch = summaryAfterRound.match(/round_count['":\s]+(\d+)/i);
const roundId = process.env.MILA_INTEGRATION_ROUND_ID || "READ_FROM_CREATE_TX_RETURN";
const openTx = process.env.MILA_INTEGRATION_ROUND_ID ? write(configuredAddress, "open_round", [process.env.MILA_INTEGRATION_ROUND_ID]) : "requires round id from deploy trace";

const seedTx = process.env.MILA_INTEGRATION_ROUND_ID
  ? write(configuredAddress, "submit_seed", [process.env.MILA_INTEGRATION_ROUND_ID, `Seed ${nonce}`, `A pause is still a plot twist ${nonce}.`])
  : "skipped without round id extraction";

const proof = `# Mila StudioNet Live Proof

NETWORK: studionet
CONTRACT: ${configuredAddress}

ROUND CREATE TX: ${createTx}
ROUND ID: ${roundId}
ROUND OPEN TX: ${openTx}
SEED SUBMIT TX: ${seedTx}

Summary after create:

\`\`\`text
${summaryAfterRound}
\`\`\`

Note: complete seed/mutation judgment trace requires robust return-data extraction for round and entry ids from the current GenLayer CLI output. This script fails on transaction finalization errors and records all available transaction hashes.
`;

mkdirSync(dirname(proofPath), { recursive: true });
writeFileSync(proofPath, proof);
console.log(proof);
console.log(`round_count_observed=${roundMatch?.[1] || "unknown"}`);
