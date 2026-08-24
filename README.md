# Mila

Mila is a GenLayer culture-lineage protocol where users submit short seeds and mutations, and validators decide whether each entry meaningfully fits, transforms, and extends the locked round.

Tagline: Culture mutates on-chain.

## Why GenLayer

A normal blockchain can deterministically store canonical text, hashes, parents, timestamps, reaction counters, depth, and non-transferable reputation. It cannot decide whether one creative work meaningfully transforms another, whether a mutation is merely a paraphrase, or whether an entry fits a cultural theme.

A centralized LLM API would make one server the trusted judge. Mila uses GenLayer so a leader proposes a bounded semantic decision and validators independently verify equivalence before deterministic contract settlement.

## Built Scope

- Real production contract: `contracts/mila.py` defines `class Mila(gl.Contract)`.
- Persistent GenVM storage: `TreeMap`, `DynArray`, `Address`, `u256`, and `@allow_storage` models.
- Public write/view API for rounds, entries, judgments, reactions, badges, SPARK, feeds, children, creator history, and summaries.
- Canonical content binding: text is stored directly and hashed from the exact content validators evaluate.
- Validator-driven `judge_entry(entry_id)` using `gl.nondet.exec_prompt(..., response_format="json")` inside `gl.vm.run_nondet_unsafe`.
- Explicit equivalence surface: exact categorical fields, +/-1 tolerance for humor/novelty bands, reason text excluded from equality.
- Deterministic settlement: verdict controls status and SPARK; model output cannot choose awards.
- Lazy SPARK decay: creator scores decay by `floor(score * 95 / 100)` per elapsed epoch and are normalized on awards, badge checks, and reads without iterating over all creators.
- Scalable indexed pagination: round feeds, child lists, and creator histories use count-plus-index `TreeMap` keys, not concatenated strings.
- REVIEW abstention for schema mismatch, uncertainty, unsafe output, or material disagreement.
- Direct Mode tests for lifecycle, parent guards, cooldown, duplicate content, reaction replacement, prompt injection, malformed outputs, consensus rollback, every verdict, lazy decay, badge persistence, pagination, SPARK, lineage, invariants, and validator disagreement.
- Next.js frontend with read/write GenLayer helpers, injected-wallet connection, transaction-state UI, and real write forms for create round, seed, mutation, and judgment.
- Patched Next.js 16.3.2 dependency tree with `npm audit --audit-level=high` clean.
- Real CLI-backed deployment and verification scripts.
- GitHub Actions CI.
- `DECISION.md` explains the consensus architecture.

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

## SPARK

SPARK is non-transferable protocol reputation. It is not money, a token sale, a wager, or an investment product.

Rules:

```text
PASS = +2
FEATURE = +4
accepted/featured mutation parent bonus = +1
badge claim requires 10 SPARK
epoch decay = floor(score * 95 / 100) per elapsed epoch
```

## Security Notes

Mila treats all user content as untrusted. Validator prompts explicitly forbid following instructions inside submitted content. Duplicate content, cooldown bypass, invalid parent mutation, closed-round submissions, reaction spam, duplicate badge claims, wrong schema version, and wrong policy version are guarded.

Indexes use bounded reads with a maximum page limit of 50. Future policy upgrades should deploy or explicitly migrate rounds because each round locks `policy_version`.

## Commands

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm run contract:test
npm audit --audit-level=high
npm run integration:studionet
```

Deployment:

```bash
npm run deploy
npm run verify:deployment
npm run integration:studionet
```

Environment:

```bash
NEXT_PUBLIC_MILA_CONTRACT_ADDRESS=
GENLAYER_PRIVATE_KEY=
GENLAYER_RPC_URL=
MILA_KEEPER_INTERVAL_MS=30000
```

## Verification Evidence

Latest local run:

```text
npm run typecheck: passing
npm run lint: passing
npm run build: passing
npm run contract:test: 58 passed
npm audit --audit-level=high: 0 vulnerabilities
npm run integration:studionet: skipped, no NEXT_PUBLIC_MILA_CONTRACT_ADDRESS or deployments/studionet.json
genvm-lint fast lint: passing
genvm-lint SDK validation: blocked locally by Windows cache permission in the GenVM SDK cache
```

Direct Mode coverage includes:

```text
round lifecycle and authorization
entry guards and canonical content normalization
all verdict settlements and SPARK effects
lazy SPARK decay across one and multiple epochs
parent bonus after stale epoch state
badge claim, persistence, duplicate claim, and decay eligibility
indexed pagination for round feed, children, and creator history
validator equivalence and non-equivalence
malformed JSON, invalid enums, wrong schema/policy, overlong fields
prompt injection variants
reaction replacement and spam prevention
consensus failure rollback from JUDGING to OPEN
decision invariants
```

## Deployment Status

Mila is not yet live on StudioNet from this workspace. No contract address or deployment transaction is claimed.

External blocker: StudioNet deployment requires a configured GenLayer account/private key and working StudioNet RPC access. Once credentials are available, run:

```bash
npm run deploy
npm run verify:deployment
```

The deploy script writes `deployments/studionet.json` with the contract address, deployment transaction, commit SHA, network, and timestamp.
