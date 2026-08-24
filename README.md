# Mila

Mila is a GenLayer culture-lineage app where seeds and mutations are judged by a bounded consensus decision, then recorded with explicit parentage and non-transferable SPARK.

Tagline: Culture mutates on-chain.

## What is built

- Next.js App Router frontend using the requested palette: `#F5EBFA`, `#E7DBEF`, `#A56ABD`, `#6E3482`, `#49225B`.
- Required routes: `/`, `/rounds`, `/rounds/new`, `/rounds/[id]`, `/rounds/[id]/seed`, `/entry/[id]`, `/entry/[id]/mutate`, `/lineage/[id]`, `/creators/[address]`, `/spark`, `/about/rules`.
- Shared Mila domain model with the canonical decision schema, round config, entry state, lineage links, evidence rows, and SPARK rules.
- GenLayer JS read-client helper targeting StudioNet and gated by `NEXT_PUBLIC_MILA_CONTRACT_ADDRESS`.
- Local deterministic contract reference model in `contracts/mila.py`.
- Contract tests covering seed judgment, mutation parent guards, parent bonuses, duplicate/cooldown rejection, and epoch decay.
- Deployment, verification, and keeper preflight scripts.

The app uses local preview records until a real StudioNet deployment address is set. Preview state is intentionally labeled as such.

## Contract Boundary

Deterministic contract logic owns authorization, duplicate hashes, cooldowns, caps, depth limits, status transitions, reaction recording, SPARK accounting, round closing, epoch advancement, and read APIs.

GenLayer semantic judgment should produce one bounded `Decision`:

```text
verdict, humor_band, novelty_band, theme_fit, transformation,
derivative_risk, safety_band, reward_band, parent_consistency,
short_reason, schema_version, policy_version, evidence
```

SPARK is non-transferable protocol state. It is not money, a token sale, a wager, or an investment product.

## Commands

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm run contract:test
```

Operational scripts:

```bash
npm run deploy
npm run verify:deployment
npm run keeper
```

## Environment

Copy `.env.example` and set:

```bash
NEXT_PUBLIC_MILA_CONTRACT_ADDRESS=
GENLAYER_PRIVATE_KEY=
GENLAYER_RPC_URL=
MILA_KEEPER_INTERVAL_MS=30000
```

`GENLAYER_PRIVATE_KEY` is only needed for deployment. `NEXT_PUBLIC_MILA_CONTRACT_ADDRESS` enables contract reads in the frontend after deployment.

## Verification Status

Last local verification:

- `npm run build`: passing
- `npm run typecheck`: passing
- `npm run lint`: passing
- `npm run contract:test`: passing

Remaining external step: deploy `contracts/mila.py` to GenLayer StudioNet with the project wallet, then set `NEXT_PUBLIC_MILA_CONTRACT_ADDRESS` and run `npm run verify:deployment`.
