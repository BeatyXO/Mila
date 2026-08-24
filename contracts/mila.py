"""Mila protocol contract model.

This file is written as a GenLayer-ready contract boundary plus a deterministic
Python reference model that can be tested locally before deployment. The only
nondeterministic step should be the validator decision that answers whether a
seed or mutation meaningfully transforms its parent and fits the locked round.
"""

from dataclasses import dataclass, field
from enum import Enum
from hashlib import sha256
from time import time


class EntryStatus(str, Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    JUDGING = "JUDGING"
    ACCEPTED = "ACCEPTED"
    FEATURED = "FEATURED"
    FLAT = "FLAT"
    REJECTED = "REJECTED"
    REVIEW = "REVIEW"
    ROUND_CLOSED = "ROUND_CLOSED"


class Verdict(str, Enum):
    FEATURE = "FEATURE"
    PASS = "PASS"
    FLAT = "FLAT"
    REJECT = "REJECT"
    REVIEW = "REVIEW"


@dataclass(frozen=True)
class Decision:
    verdict: str
    humor_band: int
    novelty_band: int
    theme_fit: str
    transformation: str
    derivative_risk: str
    safety_band: str
    reward_band: int
    parent_consistency: str
    short_reason: str
    schema_version: str = "mila.decision.v1"
    policy_version: str = "mila.policy.v1"
    evidence: tuple[str, ...] = ()


@dataclass
class Round:
    id: str
    owner: str
    theme: str
    prompt: str
    opens_at: int
    closes_at: int
    max_depth: int = 4
    seed_cap: int = 120
    mutation_cap: int = 240
    status: EntryStatus = EntryStatus.DRAFT


@dataclass
class Entry:
    id: str
    round_id: str
    creator: str
    title: str
    text_hash: str
    content_ref: str
    parent_id: str | None = None
    depth: int = 0
    status: EntryStatus = EntryStatus.OPEN
    reactions: dict[str, int] = field(default_factory=dict)


class MilaProtocol:
    """Deterministic Mila state machine.

    StudioNet deployment should map these methods to GenLayer public
    read/write functions and call `settle_judgment` only with bounded validator
    output matching `Decision`.
    """

    def __init__(self, admin: str):
        self.admin = admin
        self.rounds: dict[str, Round] = {}
        self.entries: dict[str, Entry] = {}
        self.children: dict[str, list[str]] = {}
        self.judgments: dict[str, Decision] = {}
        self.creator_spark: dict[str, int] = {}
        self.creator_history: dict[str, list[str]] = {}
        self.content_hashes: set[str] = set()
        self.last_submit_at: dict[str, int] = {}
        self.epoch = 0

    def create_round(self, caller: str, theme: str, prompt: str, opens_at: int, closes_at: int) -> str:
        self._require_admin(caller)
        if not theme or not prompt:
            raise ValueError("theme and prompt are required")
        if closes_at <= opens_at:
            raise ValueError("round close must be after open")
        round_id = self._id("round", theme, prompt, str(opens_at), str(closes_at))
        self.rounds[round_id] = Round(round_id, caller, theme, prompt, opens_at, closes_at)
        return round_id

    def open_round(self, caller: str, round_id: str) -> None:
        self._require_admin(caller)
        round_ = self._round(round_id)
        round_.status = EntryStatus.OPEN

    def submit_seed(self, caller: str, round_id: str, title: str, content_ref: str, body: str, now: int | None = None) -> str:
        round_ = self._open_round(round_id, now)
        self._require_cooldown(caller, now)
        self._require_text(body, round_.seed_cap)
        text_hash = self._unique_hash(body)
        entry_id = self._id("entry", round_id, caller, text_hash)
        self.entries[entry_id] = Entry(entry_id, round_id, caller, title, text_hash, content_ref)
        self.creator_history.setdefault(caller, []).append(entry_id)
        return entry_id

    def submit_mutation(self, caller: str, parent_id: str, title: str, content_ref: str, body: str, now: int | None = None) -> str:
        parent = self._entry(parent_id)
        round_ = self._open_round(parent.round_id, now)
        if parent.status not in {EntryStatus.ACCEPTED, EntryStatus.FEATURED}:
            raise ValueError("parent must be accepted or featured")
        if parent.depth >= round_.max_depth:
            raise ValueError("lineage depth cap reached")
        self._require_cooldown(caller, now)
        self._require_text(body, round_.mutation_cap)
        text_hash = self._unique_hash(body)
        entry_id = self._id("entry", parent.round_id, parent_id, caller, text_hash)
        self.entries[entry_id] = Entry(entry_id, parent.round_id, caller, title, text_hash, content_ref, parent_id, parent.depth + 1)
        self.children.setdefault(parent_id, []).append(entry_id)
        self.creator_history.setdefault(caller, []).append(entry_id)
        return entry_id

    def request_judgment(self, caller: str, entry_id: str) -> None:
        entry = self._entry(entry_id)
        if entry.creator != caller and caller != self.admin:
            raise PermissionError("only creator or admin may request judgment")
        if entry.status != EntryStatus.OPEN:
            raise ValueError("entry must be open")
        entry.status = EntryStatus.JUDGING

    def settle_judgment(self, caller: str, entry_id: str, decision: Decision) -> None:
        self._require_admin(caller)
        entry = self._entry(entry_id)
        if entry.status != EntryStatus.JUDGING:
            raise ValueError("entry must be judging")
        self._validate_decision(decision)
        self.judgments[entry_id] = decision
        verdict = Verdict(decision.verdict)
        if verdict == Verdict.FEATURE:
            entry.status = EntryStatus.FEATURED
            self._award(entry.creator, 4)
            if entry.parent_id:
                self._award(self._entry(entry.parent_id).creator, 1)
        elif verdict == Verdict.PASS:
            entry.status = EntryStatus.ACCEPTED
            self._award(entry.creator, 2)
            if entry.parent_id:
                self._award(self._entry(entry.parent_id).creator, 1)
        elif verdict == Verdict.FLAT:
            entry.status = EntryStatus.FLAT
        elif verdict == Verdict.REJECT:
            entry.status = EntryStatus.REJECTED
        else:
            entry.status = EntryStatus.REVIEW

    def react(self, caller: str, entry_id: str, reaction: str) -> None:
        entry = self._entry(entry_id)
        if reaction not in {"laugh", "smart", "wild"}:
            raise ValueError("unsupported reaction")
        entry.reactions[reaction] = entry.reactions.get(reaction, 0) + 1
        self._award(caller, 0)

    def close_round(self, caller: str, round_id: str) -> None:
        self._require_admin(caller)
        round_ = self._round(round_id)
        round_.status = EntryStatus.ROUND_CLOSED

    def advance_epoch(self, caller: str) -> None:
        self._require_admin(caller)
        self.epoch += 1
        for creator, spark in list(self.creator_spark.items()):
            self.creator_spark[creator] = int(spark * 95 / 100)

    def claim_creator_badge(self, caller: str) -> str:
        if self.creator_spark.get(caller, 0) < 10:
            raise ValueError("badge requires 10 SPARK")
        return self._id("badge", caller, str(self.epoch))

    def get_round(self, round_id: str) -> Round:
        return self._round(round_id)

    def get_entry(self, entry_id: str) -> Entry:
        return self._entry(entry_id)

    def get_judgment(self, entry_id: str) -> Decision | None:
        return self.judgments.get(entry_id)

    def get_children(self, entry_id: str) -> list[str]:
        return list(self.children.get(entry_id, []))

    def get_lineage(self, entry_id: str) -> list[str]:
        lineage = []
        current = self._entry(entry_id)
        while current:
            lineage.append(current.id)
            current = self.entries.get(current.parent_id) if current.parent_id else None
        return list(reversed(lineage))

    def get_creator_spark(self, creator: str) -> int:
        return self.creator_spark.get(creator, 0)

    def get_round_spark_rules(self) -> dict[str, int]:
        return {"PASS": 2, "FEATURE": 4, "PARENT_BONUS": 1, "EPOCH_DECAY_PERCENT": 5}

    def get_creator_history(self, creator: str) -> list[str]:
        return list(self.creator_history.get(creator, []))

    def get_round_feed(self, round_id: str) -> list[str]:
        return [entry.id for entry in self.entries.values() if entry.round_id == round_id]

    def _require_admin(self, caller: str) -> None:
        if caller != self.admin:
            raise PermissionError("admin only")

    def _round(self, round_id: str) -> Round:
        if round_id not in self.rounds:
            raise KeyError("unknown round")
        return self.rounds[round_id]

    def _entry(self, entry_id: str) -> Entry:
        if entry_id not in self.entries:
            raise KeyError("unknown entry")
        return self.entries[entry_id]

    def _open_round(self, round_id: str, now: int | None) -> Round:
        round_ = self._round(round_id)
        ts = int(time()) if now is None else now
        if round_.status != EntryStatus.OPEN:
            raise ValueError("round is not open")
        if ts < round_.opens_at or ts > round_.closes_at:
            raise ValueError("round is outside active window")
        return round_

    def _require_cooldown(self, caller: str, now: int | None) -> None:
        ts = int(time()) if now is None else now
        if ts - self.last_submit_at.get(caller, 0) < 30:
            raise ValueError("creator cooldown active")
        self.last_submit_at[caller] = ts

    def _require_text(self, body: str, cap: int) -> None:
        if not body.strip():
            raise ValueError("body is required")
        if len(body) > cap:
            raise ValueError("body exceeds round cap")

    def _unique_hash(self, body: str) -> str:
        text_hash = sha256(body.strip().lower().encode()).hexdigest()
        if text_hash in self.content_hashes:
            raise ValueError("duplicate content")
        self.content_hashes.add(text_hash)
        return text_hash

    def _validate_decision(self, decision: Decision) -> None:
        Verdict(decision.verdict)
        if not 0 <= decision.humor_band <= 10:
            raise ValueError("humor band out of range")
        if not 0 <= decision.novelty_band <= 10:
            raise ValueError("novelty band out of range")
        if not 0 <= decision.reward_band <= 4:
            raise ValueError("reward band out of range")
        if len(decision.short_reason) > 220:
            raise ValueError("short reason too long")
        if decision.schema_version != "mila.decision.v1":
            raise ValueError("unsupported schema")

    def _award(self, creator: str, amount: int) -> None:
        self.creator_spark[creator] = self.creator_spark.get(creator, 0) + amount

    def _id(self, *parts: str) -> str:
        return sha256(":".join(parts).encode()).hexdigest()[:16]
