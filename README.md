# Mila

Mila is a GenLayer culture-lineage app for short creative rounds. A creator opens a round, people submit seeds, accepted seeds can be mutated, and each mutation keeps a visible parent trail so the community can see how an idea changed over time.

Tagline: Culture mutates on-chain.

## Live Deployment

Mila is deployed on GenLayer StudioNet.

```text
Contract: 0xe4221b46D89955bbC531f537F4C9965F49bD7866
Deployment tx: 0xa0032c64bb16a35b842200438c4b2e8258c755962cd619fed0adda48290b6424
Source commit: e9b5c6ee1b288b38d6910854c85e88b9ac1495e2
Network: studionet
RPC: https://studio.genlayer.com/api
```

The latest closeout proof is recorded in `LIVE_PROOF.md` and includes:

```text
Round created/opened
Seed submitted and judged ACCEPTED
Mutation submitted and judged ACCEPTED
Lineage and round feed read back from chain
Creator SPARK read back from chain
Duplicate-content negative test rejected with rollback: duplicate content
```

## Product Flow

- Create a round with a locked theme, prompt, time window, max depth, and content caps.
- Submit a seed to an open round.
- Judge the seed through GenLayer validator consensus.
- Submit a mutation against an accepted or featured parent.
- Judge the mutation.
- Explore entry pages, child links, lineage, round feeds, creator history, and SPARK.

SPARK is non-transferable protocol reputation. It is not money, a token sale, a wager, or an investment product.

## Why GenLayer

A conventional smart contract can store IDs, hashes, parents, timestamps, counters, and deterministic reputation rules. It cannot reliably answer semantic questions such as:

- Does this entry fit the round theme?
- Is this mutation a meaningful transformation rather than a shallow copy?
- Is the content safe enough for the venue?
- Should this creative contribution pass, be featured, go flat, be rejected, or need review?

Mila uses GenLayer so a leader proposes a bounded semantic judgment and validators independently check whether the result is equivalent enough to settle deterministically.

## Current Contract Design

`contracts/mila.py` defines the production `class Mila(gl.Contract)`.

Core storage:

- `TreeMap[str, Round]` for rounds
- `TreeMap[str, Entry]` for entries
- `TreeMap[str, Decision]` for judgments
- count-plus-index `TreeMap` keys for round feeds, child lists, and creator histories
- `TreeMap[Address, u256]` and epoch markers for lazy SPARK decay
- duplicate-content, cooldown, reaction, and badge guard maps

The storage design intentionally avoids concatenated list blobs. Feeds, children, and creator histories are indexed with bounded pagination and a max page limit of 50.

## Consensus / Equivalence Design

`judge_entry(entry_id)` uses:

```text
gl.nondet.exec_prompt(..., response_format="json")
gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
```

The model output is sanitized into the fixed `mila.decision.v1` schema. Deterministic settlement then applies contract rules; the model does not directly choose SPARK awards.

Current live-oriented equivalence:

- REVIEW only matches REVIEW.
- Verdict, schema version, and policy version must match.
- RED or UNCERTAIN safety requires exact safety agreement.
- Non-green safety bands must agree with each other.
- Humor and novelty bands tolerate small validator variance.
- Natural-language reason/evidence text is not equality-critical.

This keeps safety/schema drift guarded while avoiding live validator deadlock over harmless wording differences.

## Contract API

Writes:

```text
create_round
open_round
close_round
submit_seed
submit_mutation
judge_entry
react
advance_epoch
claim_creator_badge
```

Views:

```text
get_summary
get_round
get_entry
get_judgment
get_children
get_lineage
get_creator_spark
get_round_spark_rules
get_creator_history
get_round_feed
get_reactions
get_badge
```

## State Machines

Round lifecycle:

```text
DRAFT -> OPEN -> ROUND_CLOSED
```

Entry lifecycle:

```text
OPEN -> JUDGING -> ACCEPTED | FEATURED | FLAT | REJECTED | REVIEW
```

## SPARK Rules

```text
PASS = +2
FEATURE = +4
accepted/featured mutation parent bonus = +1
badge claim requires 10 SPARK
epoch decay = floor(score * 95 / 100) per elapsed epoch
```

SPARK decay is lazy: the contract normalizes a creator on awards, badge checks, and reads, without iterating over all creators.

## Frontend

The app is a Next.js frontend with:

- StudioNet live mode via `NEXT_PUBLIC_MILA_CONTRACT_ADDRESS`
- demo mode when no contract address is configured
- injected-wallet connection
- create round, seed, mutation, and judgment write forms
- receipt return extraction for round/entry IDs
- redirect from new round creation to the real returned round page
- round lookup by ID
- live reads for summary, rounds, entries, lineage, creator history, reactions, and SPARK

## Environment

For Vercel frontend deployment:

```env
NEXT_PUBLIC_MILA_CONTRACT_ADDRESS=0xe4221b46D89955bbC531f537F4C9965F49bD7866
GENLAYER_RPC_URL=https://studio.genlayer.com/api
GENLAYER_ACCOUNT=0x6b476bf35c4968f3f1775c0ca2110591b4b5fcbe
```

Do not add `GENLAYER_PRIVATE_KEY` to Vercel unless you intentionally run server-side write or integration jobs there.

## Commands

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm run contract:test
npm audit --audit-level=high
```

StudioNet:

```bash
npm run deploy
npm run verify:deployment
npm run integration:studionet
```

## Verification Evidence

Latest closeout checks:

```text
npm run verify:deployment: passing
npm run integration:studionet: passing
npm run typecheck: passing
npm run contract:test: 55 passed
npm run lint: passing
npm run build: passing
```

Local Windows `genvm-lint` fast lint passes, but full SDK validation can hit a Windows GenVM SDK cache permission issue. Linux CI remains the canonical GenVM validation path.
