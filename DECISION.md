# Mila GenLayer Decision Architecture

Mila's irreducible decision is semantic: does this short cultural entry fit the locked round, and for mutations, does it meaningfully transform its parent rather than merely paraphrase it?

A normal deterministic chain can store canonical text, hashes, timestamps, parents, reaction counters, depth, reputation, and lifecycle state. It cannot decide whether one creative text transforms another, whether derivative risk is low enough, or whether a cultural theme remains intact. A centralized LLM API would solve that by appointing one judge. Mila uses GenLayer so leader and validators evaluate the same canonical on-chain text under an explicit equivalence rule.

## Consensus Flow

1. A user stores canonical content directly in contract state.
2. `judge_entry(entry_id)` loads the round, entry, and parent content.
3. The leader calls `gl.nondet.exec_prompt(..., response_format="json")`.
4. Validators independently rerun the same bounded task.
5. `gl.vm.run_nondet_unsafe` accepts only field-level equivalent decisions.
6. The agreed `Decision` is sanitized.
7. Deterministic invariants are applied.
8. Deterministic code settles entry status and SPARK.

## Equivalence Surface

Exact equality is required for `verdict`, `theme_fit`, `derivative_risk`, `parent_consistency`, `safety_band`, `schema_version`, and `policy_version`.

`humor_band` and `novelty_band` may differ by at most one point. LLMs often score borderline subjective qualities slightly differently, and a one-point tolerance preserves consensus without allowing material disagreement.

`short_reason`, `transformation`, and `evidence` are bounded and stored for audit, but wording differences do not determine equivalence.

`REVIEW` is an abstention result. If either side reaches `REVIEW`, the other must also reach `REVIEW`; Mila does not convert uncertainty into a pass.

`REVIEW` is different from consensus failure. A consensus result of `REVIEW` is a successful semantic abstention and settles the entry to `REVIEW`. A malformed leader result, malformed validator result, or validator non-equivalence causes the transaction to fail; Mila restores the entry from `JUDGING` to `OPEN` before rethrowing so the entry is not stranded.

## Deterministic Settlement

Validators return a bounded decision only. Contract code maps:

- `FEATURE` to `FEATURED` and +4 SPARK
- `PASS` to `ACCEPTED` and +2 SPARK
- `FLAT` to `FLAT`
- `REJECT` to `REJECTED`
- `REVIEW` to `REVIEW`

Parent bonus is always +1 for accepted/featured mutations. `reward_band` is informational and sanitized to match the verdict, so it cannot conflict with settlement rules.

SPARK decays lazily. The contract stores `creator_spark` and `creator_spark_epoch`; on award, badge eligibility, and reads, the effective score is normalized by applying `floor(score * 95 / 100)` once for each elapsed epoch. `advance_epoch()` is O(1) and never loops over all creators.

## Indexed State

Round feeds, child lists, and creator histories use count-plus-index maps:

- `round_entry_count[round_id]` and `round_entries["round::<round_id>::<index>"]`
- `child_count[parent_id]` and `child_entries["child::<parent_id>::<index>"]`
- `creator_entry_count[address]` and `creator_entries["creator::<address>::<index>"]`

This makes paginated reads bounded by `MAX_PAGE_LIMIT` without splitting a full history string.

## Invariants

Mila rejects logically contradictory settlements after consensus:

- `FEATURE`/`PASS` with `theme_fit == NONE` becomes `REJECT`.
- `FEATURE` with `derivative_risk == HIGH` becomes `FLAT`.
- root entries require `parent_consistency == ROOT`.
- mutations cannot use `parent_consistency == ROOT`.
- `FEATURE` requires green safety.

These invariants do not decide humor or novelty; they prevent impossible state from being stored.

## Security Posture

User content is untrusted. Validator prompts explicitly state that entry text cannot override Mila rules, schemas, policy, or output format. Canonical text is stored on-chain and hashed, so validators judge exactly the content submitted in the transaction.

Lifecycle guards prevent closed-round submissions, invalid parent mutation, spoofed creators, duplicate content, cooldown bypasses, reaction spam, duplicate badge claims, stale badge eligibility after decay, and unsupported policy/schema versions.

## Limitations

Mila's semantic quality depends on GenLayer validator/provider configuration and the strength of the prompt. The current contract routes uncertain or schema-mismatched but parseable model output to `REVIEW`; malformed or non-equivalent nondeterministic execution fails the transaction and restores the entry to `OPEN`. StudioNet deployment and live trace evidence are not yet present in this workspace.
