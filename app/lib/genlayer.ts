import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
type MilaCalldata = null | boolean | number | bigint | string | Uint8Array | MilaCalldata[] | { [key: string]: MilaCalldata };
export const MILA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS as `0x${string}` | undefined;
export const milaReadClient = createClient({ chain: studionet });
export function requireContractAddress(): `0x${string}` { if (!MILA_CONTRACT_ADDRESS) throw new Error("Mila is not connected to a deployed contract yet."); return MILA_CONTRACT_ADDRESS; }
export async function readMila(functionName: string, args: MilaCalldata[] = []) { return milaReadClient.readContract({ address: requireContractAddress(), functionName, args }); }
