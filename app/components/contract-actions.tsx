"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { extractReturnedString, milaWrites, waitForMilaTx } from "../lib/genlayer";
import { useMilaWallet } from "./wallet-client";

type TxState = {
  label: string;
  hash?: string;
  error?: string;
};

function TxPanel({ state }: { state: TxState }) {
  return (
    <div className="tx-drawer">
      <span>{state.label}</span>
      {state.hash ? <code>{state.hash}</code> : null}
      {state.error ? <small>{state.error}</small> : null}
    </div>
  );
}

function toEpochSeconds(value: FormDataEntryValue | null) {
  const date = typeof value === "string" ? new Date(value) : new Date();
  return BigInt(Math.floor(date.getTime() / 1000));
}

export function CreateRoundForm() {
  const { wallet, connect } = useMilaWallet();
  const router = useRouter();
  const [tx, setTx] = useState<TxState>({ label: "Awaiting wallet" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const active = wallet.address ? wallet : await connect();
    if (!active?.address || !active.provider) return setTx({ label: "Failed", error: "Wallet connection required." });
    const data = new FormData(event.currentTarget);
    try {
      setTx({ label: "Awaiting wallet signature" });
      const hash = await milaWrites.createRound(active.address, active.provider, [
        String(data.get("theme") || ""),
        String(data.get("prompt") || ""),
        toEpochSeconds(data.get("opens_at")),
        toEpochSeconds(data.get("closes_at")),
        BigInt(String(data.get("max_depth") || "4")),
        BigInt(String(data.get("seed_cap") || "140")),
        BigInt(String(data.get("mutation_cap") || "240")),
      ]);
      setTx({ label: "Consensus pending", hash });
      const receipt = await waitForMilaTx(hash);
      const roundId = extractReturnedString(receipt);
      setTx({ label: roundId ? `Accepted / round ${roundId}` : "Accepted", hash });
      if (roundId) router.push(`/rounds/${roundId}`);
    } catch (error) {
      setTx({ label: "Failed", error: error instanceof Error ? error.message : "Transaction failed." });
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Theme<input name="theme" required placeholder="Office lore" /></label>
      <label>Prompt<textarea name="prompt" required placeholder="The seed premise for the round" /></label>
      <label>Opens at<input name="opens_at" type="datetime-local" required /></label>
      <label>Closes at<input name="closes_at" type="datetime-local" required /></label>
      <label>Max depth<input name="max_depth" type="number" min={1} max={12} defaultValue={4} /></label>
      <label>Seed cap<input name="seed_cap" type="number" min={12} max={1000} defaultValue={140} /></label>
      <label>Mutation cap<input name="mutation_cap" type="number" min={12} max={1000} defaultValue={240} /></label>
      <button className="primary-button" type="submit">Create round</button>
      <TxPanel state={tx} />
    </form>
  );
}

export function OpenRoundByIdForm() {
  const [roundId, setRoundId] = useState("");
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = roundId.trim();
    if (!normalized) return;
    router.push(`/rounds/${encodeURIComponent(normalized)}`);
  }

  return (
    <form className="inline-route-form" onSubmit={submit}>
      <label>
        Open round by ID
        <input value={roundId} onChange={(event) => setRoundId(event.target.value)} placeholder="7509db097a5cfd16b7e00cce" />
      </label>
      <button className="primary-button" type="submit">Open round</button>
    </form>
  );
}

export function SubmitSeedForm({ roundId }: { roundId: string }) {
  const { wallet, connect } = useMilaWallet();
  const [tx, setTx] = useState<TxState>({ label: "Awaiting wallet" });
  const [entryId, setEntryId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const active = wallet.address ? wallet : await connect();
    if (!active?.address || !active.provider) return setTx({ label: "Failed", error: "Wallet connection required." });
    const data = new FormData(event.currentTarget);
    try {
      const hash = await milaWrites.submitSeed(active.address, active.provider, roundId, String(data.get("title") || ""), String(data.get("content") || ""));
      setTx({ label: "Consensus pending", hash });
      const receipt = await waitForMilaTx(hash);
      const returned = extractReturnedString(receipt);
      if (returned) setEntryId(returned);
      setTx({ label: returned ? `Accepted / entry ${returned}` : "Accepted", hash });
    } catch (error) {
      setTx({ label: "Failed", error: error instanceof Error ? error.message : "Transaction failed." });
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Seed title<input name="title" required placeholder="A compact culture hook" /></label>
      <label>Seed text<textarea name="content" required placeholder="The premise, caption, or setup" /></label>
      <label>Entry id for judgment<input value={entryId} onChange={(event) => setEntryId(event.target.value)} placeholder="Filled automatically after accepted receipt" /></label>
      <button className="primary-button" type="submit">Submit seed</button>
      <JudgeEntryButton entryId={entryId} />
      <TxPanel state={tx} />
    </form>
  );
}

export function SubmitMutationForm({ parentId }: { parentId: string }) {
  const { wallet, connect } = useMilaWallet();
  const [tx, setTx] = useState<TxState>({ label: "Awaiting wallet" });
  const [entryId, setEntryId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const active = wallet.address ? wallet : await connect();
    if (!active?.address || !active.provider) return setTx({ label: "Failed", error: "Wallet connection required." });
    const data = new FormData(event.currentTarget);
    try {
      const hash = await milaWrites.submitMutation(active.address, active.provider, parentId, String(data.get("title") || ""), String(data.get("content") || ""));
      setTx({ label: "Consensus pending", hash });
      const receipt = await waitForMilaTx(hash);
      const returned = extractReturnedString(receipt);
      if (returned) setEntryId(returned);
      setTx({ label: returned ? `Accepted / entry ${returned}` : "Accepted", hash });
    } catch (error) {
      setTx({ label: "Failed", error: error instanceof Error ? error.message : "Transaction failed." });
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Mutation title<input name="title" required placeholder="The next beat" /></label>
      <label>Mutation text<textarea name="content" required placeholder="The twist, callback, or remix" /></label>
      <label>Entry id for judgment<input value={entryId} onChange={(event) => setEntryId(event.target.value)} placeholder="Filled automatically after accepted receipt" /></label>
      <button className="primary-button" type="submit">Submit mutation</button>
      <JudgeEntryButton entryId={entryId} />
      <TxPanel state={tx} />
    </form>
  );
}

export function JudgeEntryButton({ entryId }: { entryId: string }) {
  const { wallet, connect } = useMilaWallet();
  const [tx, setTx] = useState<TxState>({ label: "Validators idle" });

  async function judge() {
    const active = wallet.address ? wallet : await connect();
    if (!active?.address || !active.provider || !entryId) return setTx({ label: "Failed", error: "Wallet and entry id required." });
    try {
      const hash = await milaWrites.judgeEntry(active.address, active.provider, entryId);
      setTx({ label: "Validators are evaluating semantic equivalence", hash });
      await waitForMilaTx(hash);
      setTx({ label: "Accepted", hash });
    } catch (error) {
      setTx({ label: "Failed", error: error instanceof Error ? error.message : "Judgment failed." });
    }
  }

  return (
    <>
      <button className="outline-button" type="button" onClick={judge}>Judge entry</button>
      <TxPanel state={tx} />
    </>
  );
}
