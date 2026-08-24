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
- REVIEW abstention for schema mismatch, uncertainty, unsafe output, or material disagreement.
- Direct Mode tests for lifecycle, parent guards, cooldown, duplicate content, reaction dedupe, prompt injection, REVIEW, SPARK, lineage, and validator disagreement.
- Next.js frontend with read/write GenLayer helpers for StudioNet.
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
```

## Security Notes

Mila treats all user content as untrusted. Validator prompts explicitly forbid following instructions inside submitted content. Duplicate content, cooldown bypass, invalid parent mutation, closed-round submissions, reaction spam, duplicate badge claims, wrong schema version, and wrong policy version are guarded.

Indexes use bounded reads with a maximum page limit. Future policy upgrades should deploy or explicitly migrate rounds because each round locks `policy_version`.

## Commands

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm run contract:test
npm audit --audit-level=high
```

Deployment:

```bash
npm run deploy
npm run verify:deployment
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
npm run contract:test: 6 passed
npm audit --audit-level=high: 0 vulnerabilities
genvm-lint fast lint: passing
genvm-lint SDK validation: blocked locally by Windows cache permission / missing SDK cache
```

Direct Mode tests passed:

```text
test_seed_judgment_pass_awards_spark
test_mutation_requires_accepted_parent
test_featured_mutation_awards_parent_bonus_and_lineage
test_duplicate_content_cooldown_reaction_and_badge_guards
test_review_abstention_for_wrong_schema_and_prompt_injection
test_validator_equivalence_tolerance
```

## Deployment Status

Mila is not yet live on StudioNet from this workspace. No contract address or deployment transaction is claimed.

External blocker: StudioNet deployment requires a configured GenLayer account/private key and working StudioNet RPC access. Once credentials are available, run:

```bash
npm run deploy
npm run verify:deployment
```

The deploy script writes `deployments/studionet.json` with the contract address, deployment transaction, commit SHA, network, and timestamp.
