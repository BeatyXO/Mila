import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const deploymentPath = resolve(root, "deployments", "studionet.json");
const proofPath = resolve(root, "LIVE_PROOF.md");
const genlayerBin = resolveGenlayerBin();
const rpc = requiredEnv("GENLAYER_RPC_URL");
const address = process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS || readAddress();
const account = requiredEnv("GENLAYER_ACCOUNT");

if (!address) throw new Error("NEXT_PUBLIC_MILA_CONTRACT_ADDRESS or deployments/studionet.json contractAddress is required.");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for StudioNet integration; refusing to skip live proof.`);
  return value;
}

function readAddress() {
  if (!existsSync(deploymentPath)) return "";
  return JSON.parse(readFileSync(deploymentPath, "utf8")).contractAddress || "";
}

function run(args) {
  const command = process.platform === "win32" ? [genlayerBin, ...args].map(quoteArg).join(" ") : genlayerBin;
  return execFileSync(command, process.platform === "win32" ? [] : args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    shell: process.platform === "win32",
  });
}

function quoteArg(value) {
  return `"${String(value).replaceAll('"', '\\"')}"`;
}

function resolveGenlayerBin() {
  if (process.platform !== "win32") return "genlayer";
  return process.env.APPDATA ? resolve(process.env.APPDATA, "npm", "genlayer.cmd") : "genlayer.cmd";
}

function txHash(output) {
  const match = output.match(/0x[a-fA-F0-9]{64}/);
  if (!match) throw new Error(`No transaction hash found:\n${output}`);
  return match[0];
}

function extractReturnedString(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const normalized = text.trim().replace(/^["']|["']$/g, "");
  if (/^(round|entry|badge)?[a-f0-9]{16,64}$/i.test(normalized) || /^[a-f0-9]{24}$/i.test(normalized)) return normalized;
  const jsonCandidates = [...text.matchAll(/\{[\s\S]*\}|\[[\s\S]*\]/g)].map((match) => match[0]);
  for (const candidate of jsonCandidates) {
    try {
      const found = walk(JSON.parse(candidate));
      if (found) return found;
    } catch {
      // CLI output is often mixed human text + JSON; ignore non-JSON spans.
    }
  }
  const explicit = text.match(/(?:return(?:ed)?(?:Value|_value| data)?|result|id)["':=\s]+((?:round|entry|badge)?[a-f0-9]{16,64}|[a-f0-9]{24})/i);
  if (explicit) return explicit[1];
  const readablePayload = text.match(/payload:\s*\{\s*readable:\s*['"]['"]?([a-f0-9]{24,64})['"]?['"]\s*\}/i);
  if (readablePayload) return readablePayload[1];
  return "";
}

function walk(input, seen = new Set()) {
  if (!input || seen.has(input)) return "";
  if (typeof input === "string") return extractReturnedString(input);
  if (Array.isArray(input)) {
    for (const item of input) {
      const found = walk(item, seen);
      if (found) return found;
    }
    return "";
  }
  if (typeof input === "object") {
    seen.add(input);
    for (const key of ["returnValue", "return_value", "returnData", "return_data", "result", "stdout", "calldata", "data", "id"]) {
      const found = walk(input[key], seen);
      if (found) return found;
    }
    for (const item of Object.values(input)) {
      const found = walk(item, seen);
      if (found) return found;
    }
  }
  return "";
}

function wait(hash) {
  const receipt = run(["receipt", hash, "--status", "ACCEPTED", "--rpc", rpc, "--retries", "120", "--interval", "5000"]);
  if (!/FINALIZED|ACCEPTED|FINISHED_WITH_RETURN|success/i.test(receipt)) {
    throw new Error(`Transaction did not finalize successfully:\n${receipt}`);
  }
  return receipt;
}

function write(method, args) {
  const output = run(["write", address, method, "--rpc", rpc, "--args", ...args.map(String)]);
  const hash = txHash(output);
  const receipt = wait(hash);
  return { hash, receipt, returned: extractReturnedString(`${output}\n${receipt}`) };
}

function call(method, args = []) {
  const command = ["call", address, method, "--rpc", rpc];
  if (args.length) command.push("--args", ...args.map(String));
  return run(command);
}

function lastIdFromCall(output) {
  const ids = [...output.matchAll(/'([a-f0-9]{24})'|"([a-f0-9]{24})"/gi)].map((match) => match[1] || match[2]);
  if (!ids.length) throw new Error(`No 24-hex id found in call output:\n${output}`);
  return ids.at(-1);
}

function requireReturn(step, result) {
  if (!result.returned) {
    throw new Error(`${step} did not expose a returned id in CLI output/receipt. Output:\n${result.receipt}`);
  }
  return result.returned;
}

const nonce = Date.now();
const opens = Math.floor(Date.now() / 1000) - 60;
const closes = opens + 86400;

const createRound = write("create_round", [`Office lore ${nonce}`, `The group chat went quiet ${nonce}.`, opens, closes, 4, 140, 240]);
const roundId = requireReturn("create_round", createRound);
const openRound = write("open_round", [roundId]);
const seed = write("submit_seed", [roundId, `Seed ${nonce}`, `A pause is still a plot twist ${nonce}.`]);
const seedId = lastIdFromCall(call("get_round_feed", [roundId, 0, 10]));
const seedJudgment = write("judge_entry", [seedId]);
const seedEntry = call("get_entry", [seedId]);
const seedDecision = call("get_judgment", [seedId]);
const mutation = write("submit_mutation", [seedId, `Mutation ${nonce}`, `The typing dots became a standing meeting ${nonce}.`]);
const mutationId = lastIdFromCall(call("get_children", [seedId, 0, 10]));
const mutationJudgment = write("judge_entry", [mutationId]);
const mutationEntry = call("get_entry", [mutationId]);
const mutationDecision = call("get_judgment", [mutationId]);
const lineage = call("get_lineage", [mutationId]);
const feed = call("get_round_feed", [roundId, 0, 10]);
const spark = call("get_creator_spark", [account]);
const history = call("get_creator_history", [account, 0, 10]);
const summary = call("get_summary");

const proof = `# Mila StudioNet Live Proof

NETWORK: studionet
CONTRACT: ${address}

ROUND CREATE TX: ${createRound.hash}
ROUND ID: ${roundId}
ROUND OPEN TX: ${openRound.hash}
SEED SUBMIT TX: ${seed.hash}
SEED ID: ${seedId}
SEED JUDGMENT TX: ${seedJudgment.hash}
MUTATION SUBMIT TX: ${mutation.hash}
MUTATION ID: ${mutationId}
MUTATION JUDGMENT TX: ${mutationJudgment.hash}

## Summary

\`\`\`text
${summary}
\`\`\`

## Seed Entry

\`\`\`text
${seedEntry}
\`\`\`

## Seed Decision

\`\`\`text
${seedDecision}
\`\`\`

## Mutation Entry

\`\`\`text
${mutationEntry}
\`\`\`

## Mutation Decision

\`\`\`text
${mutationDecision}
\`\`\`

## Mutation Lineage

\`\`\`text
${lineage}
\`\`\`

## Round Feed

\`\`\`text
${feed}
\`\`\`

## Creator SPARK

\`\`\`text
${spark}
\`\`\`

## Creator History

\`\`\`text
${history}
\`\`\`
`;

mkdirSync(dirname(proofPath), { recursive: true });
writeFileSync(proofPath, proof);
console.log(proof);
