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
7. Deterministic code settles entry status and SPARK.

## Equivalence Surface

Exact equality is required for `verdict`, `theme_fit`, `derivative_risk`, `parent_consistency`, `safety_band`, `schema_version`, and `policy_version`.

`humor_band` and `novelty_band` may differ by at most one point. LLMs often score borderline subjective qualities slightly differently, and a one-point tolerance preserves consensus without allowing material disagreement.

`short_reason`, `transformation`, and `evidence` are bounded and stored for audit, but wording differences do not determine equivalence.

`REVIEW` is an abstention result. If either side reaches `REVIEW`, the other must also reach `REVIEW`; Mila does not convert uncertainty into a pass.

## Deterministic Settlement

Validators return a bounded decision only. Contract code maps:

- `FEATURE` to `FEATURED` and +4 SPARK
- `PASS` to `ACCEPTED` and +2 SPARK
- `FLAT` to `FLAT`
- `REJECT` to `REJECTED`
- `REVIEW` to `REVIEW`

Parent bonus is always +1 for accepted/featured mutations. `reward_band` is informational and sanitized to match the verdict, so it cannot conflict with settlement rules.

## Security Posture

User content is untrusted. Validator prompts explicitly state that entry text cannot override Mila rules, schemas, policy, or output format. Canonical text is stored on-chain and hashed, so validators judge exactly the content submitted in the transaction.

Lifecycle guards prevent closed-round submissions, invalid parent mutation, spoofed creators, duplicate content, cooldown bypasses, reaction spam, duplicate badge claims, and unsupported policy/schema versions.

## Limitations

Mila's semantic quality depends on GenLayer validator/provider configuration and the strength of the prompt. The current contract intentionally routes malformed, uncertain, or schema-mismatched model output to `REVIEW` rather than pretending consensus confidence exists.
