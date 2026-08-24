import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowUpRight, GitBranch, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { MilaEntry, MilaRound, Verdict, hasContractAddress, shortAddress } from "../lib/mila";
import { WalletButton } from "./wallet-client";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main id="top">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">M</span>
          <span>Mila</span>
        </Link>
        <nav>
          <Link href="/rounds">Rounds</Link>
          <Link href="/spark">SPARK</Link>
          <Link href="/about/rules">Rules</Link>
        </nav>
        <div className="header-actions">
          <NetworkGuard />
          <WalletButton />
        </div>
      </header>
      {!hasContractAddress() ? <div className="demo-banner">Mila Demo Mode - no StudioNet contract configured</div> : null}
      {children}
      <footer>
        <div className="brand">
          <span className="brand-mark">M</span>
          <span>Mila</span>
        </div>
        <span>Culture mutates on-chain.</span>
        <span className="footer-right">Built for GenLayer StudioNet</span>
      </footer>
    </main>
  );
}

export function NetworkGuard() {
  return <span className="chain-badge">{hasContractAddress() ? "StudioNet mode" : "Demo mode"}</span>;
}

export function TxStatusDrawer() {
  return (
    <aside className="tx-drawer">
      <Loader2 size={15} /> Waiting for a submitted transaction.
    </aside>
  );
}

export function VerdictStamp({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`verdict ${verdict.toLowerCase()}`}>
      <span />
      {verdict}
    </span>
  );
}

export function SeedCapsule({ round }: { round: MilaRound }) {
  return (
    <section className="seed-capsule">
      <p className="eyebrow">ROUND {round.epoch} / {round.status}</p>
      <h1>{round.prompt}</h1>
      <p>{round.theme} is locked for this epoch. Seeds and mutations must keep the lineage legible.</p>
      <div className="hero-cta">
        <Link className="primary-button" href={`/rounds/${round.id}/seed`}>
          Start seed <ArrowUpRight size={17} />
        </Link>
        <Link className="text-link" href={`/rounds/${round.id}`}>
          Open round
        </Link>
      </div>
    </section>
  );
}

export function CultureDial({ round }: { round: MilaRound }) {
  return (
    <div className="rule-card">
      <div className="card-kicker">
        <span>THE CULTURE DIAL</span>
        <span className="dial-pin">●</span>
      </div>
      <div className="dial-graphic">
        <div className="dial-inner">
          <b>{round.theme.toUpperCase()}</b>
          <small>locked theme</small>
        </div>
      </div>
      <div className="rule-lines">
        <div><span>Seed cap</span><b>{round.seedCap}</b></div>
        <div><span>Mutation cap</span><b>{round.mutationCap}</b></div>
        <div><span>Safety</span><b><ShieldCheck size={14} /> {round.safetyProfile}</b></div>
      </div>
    </div>
  );
}

export function LineageNode({ entry }: { entry: MilaEntry }) {
  return (
    <Link className="lineage-node" style={{ marginLeft: `${entry.depth * 36}px` }} href={`/entry/${entry.id}`}>
      <div className="node-top">
        <span className="node-index">{entry.id}</span>
        <VerdictStamp verdict={entry.verdict} />
      </div>
      <strong>{entry.title}</strong>
      <small>{entry.text}</small>
      <div className="node-foot">
        <span>{shortAddress(entry.creator)}</span>
        <span className="spark-label">+{entry.spark} SPARK</span>
      </div>
    </Link>
  );
}

export function LineageWeb({ entries }: { entries: MilaEntry[] }) {
  return (
    <section className="lineage-card">
      <div className="lineage-head">
        <div>
          <p className="card-kicker">LINEAGE WEB <span className="count">{entries.length} nodes</span></p>
          <h3>One premise. Many ways out.</h3>
        </div>
        <GitBranch size={25} />
      </div>
      <div className="lineage-list">{entries.map((entry) => <LineageNode key={entry.id} entry={entry} />)}</div>
    </section>
  );
}

export function JudgmentBreakdown({ entry }: { entry: MilaEntry }) {
  const rows = Object.entries(entry.decision);
  return (
    <section className="detail-card">
      <p className="card-kicker">CONSENSUS PANEL</p>
      <div className="detail-poster">
        <span className="poster-label">{entry.verdict}</span>
        <h3>{entry.title}</h3>
        <div className="poster-divider" />
        <p>{entry.decision.short_reason}</p>
      </div>
      <div className="detail-meta">
        {rows.map(([key, value]) => (
          <div key={key}><span>{key}</span><b>{String(value)}</b></div>
        ))}
      </div>
    </section>
  );
}

export function SparkCell({ entries }: { entries: MilaEntry[] }) {
  const total = entries.reduce((sum, entry) => sum + entry.spark, 0);
  return (
    <section className="spark-section">
      <div>
        <p className="eyebrow">THE SPARK CELL</p>
        <h2>Contribution, made visible.</h2>
        <p>SPARK is non-transferable protocol state for accepted creative contribution. It has no price, redemption value, or financial promise.</p>
      </div>
      <div className="spark-stat"><span>PREVIEW TOTAL</span><strong>{total}</strong><small>local data until contract address is configured</small></div>
      <div className="spark-stat"><span>YOUR BALANCE</span><strong>-</strong><small>connect wallet to read creator state</small></div>
      <div className="spark-footer"><span><b>PASS</b> +2 SPARK</span><span><b>FEATURED</b> +4 SPARK</span><span><b>DECAY</b> 5% / epoch</span></div>
    </section>
  );
}

export function EmptyState({ title }: { title: string }) {
  return <div className="empty-state"><Sparkles size={18} /> {title}</div>;
}

export function ErrorState({ title }: { title: string }) {
  return <div className="error-state"><AlertTriangle size={18} /> {title}</div>;
}

export function RulebookSheet({ round }: { round: MilaRound }) {
  return (
    <section className="rules-sheet">
      <h1>Mila rulebook</h1>
      <p>The contract accepts culture only through deterministic gates first, then bounded GenLayer judgment.</p>
      <div className="rules-grid">
        <div><span>Statuses</span><b>DRAFT, OPEN, JUDGING, ACCEPTED, FEATURED, FLAT, REJECTED, REVIEW, ROUND_CLOSED</b></div>
        <div><span>Writes</span><b>create_round, open_round, submit_seed, submit_mutation, request_judgment, react, close_round, advance_epoch</b></div>
        <div><span>Reads</span><b>round, entry, judgment, children, lineage, creator SPARK, creator history, round feed</b></div>
        <div><span>SPARK</span><b>{round.sparkRules.join("; ")}</b></div>
      </div>
    </section>
  );
}
