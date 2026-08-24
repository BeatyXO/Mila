const address = process.env.NEXT_PUBLIC_MILA_CONTRACT_ADDRESS;
const intervalMs = Number(process.env.MILA_KEEPER_INTERVAL_MS || 30000);

if (!address) {
  console.error("NEXT_PUBLIC_MILA_CONTRACT_ADDRESS is required for keeper mode.");
  process.exit(1);
}

console.log(`Mila keeper watching ${address}`);
console.log(`Interval: ${intervalMs}ms`);
console.log("Keeper responsibilities: request pending judgments, close expired rounds, and advance epochs after review.");
