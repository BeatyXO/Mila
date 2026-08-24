import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus, type Hash } from "genlayer-js/types";

type MilaCalldata = null | boolean | number | bigint | string | Uint8Array | MilaCalldata[] | { [key: string]: MilaCalldata };
type TxHash = Hash;
type Provider = unknown;

export const MILA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS as `0x${string}` | undefined;
export const milaReadClient = createClient({ chain: studionet });

export function requireContractAddress(): `0x${string}` {
  if (!MILA_CONTRACT_ADDRESS) throw new Error("Mila is in demo mode. Set NEXT_PUBLIC_MILA_CONTRACT_ADDRESS for StudioNet mode.");
  return MILA_CONTRACT_ADDRESS;
}

export function isStudioNetMode() {
  return Boolean(MILA_CONTRACT_ADDRESS);
}

export async function readMila(functionName: string, args: MilaCalldata[] = []) {
  return milaReadClient.readContract({ address: requireContractAddress(), functionName, args });
}

export function createMilaWriteClient(account: `0x${string}`, provider?: Provider) {
  return createClient({ chain: studionet, account, provider });
}

export async function waitForMilaTx(hash: TxHash, status = TransactionStatus.ACCEPTED) {
  const receipt = await milaReadClient.waitForTransactionReceipt({ hash, status });
  return receipt;
}

export function extractReturnedString(value: unknown): string {
  const seen = new Set<unknown>();
  function walk(input: unknown): string {
    if (!input || seen.has(input)) return "";
    if (typeof input === "string") {
      if (/^(round|entry|badge)?[a-f0-9]{16,64}$/i.test(input) || /^[a-f0-9]{24}$/i.test(input)) return input;
      return "";
    }
    if (Array.isArray(input)) {
      for (const item of input) {
        const found = walk(item);
        if (found) return found;
      }
      return "";
    }
    if (typeof input === "object") {
      seen.add(input);
      const record = input as Record<string, unknown>;
      for (const key of ["returnValue", "return_value", "returnData", "return_data", "result", "stdout", "calldata", "data"]) {
        const found = walk(record[key]);
        if (found) return found;
      }
      for (const item of Object.values(record)) {
        const found = walk(item);
        if (found) return found;
      }
    }
    return "";
  }
  return walk(value);
}

export async function writeMila(account: `0x${string}`, provider: Provider, functionName: string, args: MilaCalldata[] = []) {
  const client = createMilaWriteClient(account, provider);
  await client.connect("studionet");
  const hash = await client.writeContract({
    address: requireContractAddress(),
    functionName,
    args,
    value: BigInt(0),
  });
  return hash;
}

export const milaWrites = {
  createRound: (account: `0x${string}`, provider: Provider, args: [string, string, bigint, bigint, bigint, bigint, bigint]) =>
    writeMila(account, provider, "create_round", args),
  openRound: (account: `0x${string}`, provider: Provider, roundId: string) => writeMila(account, provider, "open_round", [roundId]),
  submitSeed: (account: `0x${string}`, provider: Provider, roundId: string, title: string, content: string) =>
    writeMila(account, provider, "submit_seed", [roundId, title, content]),
  submitMutation: (account: `0x${string}`, provider: Provider, parentId: string, title: string, content: string) =>
    writeMila(account, provider, "submit_mutation", [parentId, title, content]),
  judgeEntry: (account: `0x${string}`, provider: Provider, entryId: string) => writeMila(account, provider, "judge_entry", [entryId]),
  react: (account: `0x${string}`, provider: Provider, entryId: string, reaction: "laugh" | "smart" | "wild") =>
    writeMila(account, provider, "react", [entryId, reaction]),
  closeRound: (account: `0x${string}`, provider: Provider, roundId: string) => writeMila(account, provider, "close_round", [roundId]),
  advanceEpoch: (account: `0x${string}`, provider: Provider) => writeMila(account, provider, "advance_epoch", []),
  claimCreatorBadge: (account: `0x${string}`, provider: Provider) => writeMila(account, provider, "claim_creator_badge", []),
};
