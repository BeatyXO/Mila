import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const address = process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS;
if (!address) {
  console.error("NEXT_PUBLIC_MILA_CONTRACT_ADDRESS is not set.");
  process.exit(1);
}

const client = createClient({ chain: studionet });
console.log("Verifying Mila deployment reads...");
console.log(`Contract: ${address}`);
console.log(`Client ready: ${Boolean(client)}`);
console.log("Run a get_round read with your deployed round id after deployment.");
