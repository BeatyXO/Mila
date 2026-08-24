import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AppShell, CultureDial, LineageWeb, SeedCapsule, SparkCell } from "./components/mila-ui";
import { isStudioNetMode } from "./lib/genlayer";
import { previewEntries, previewRound } from "./lib/mila";
import { milaReads } from "./lib/mila-contract";

export default async function Home() {
  if (isStudioNetMode()) {
    const summary = await milaReads.getSummary();
    return (
      <AppShell>
        <section className="hero dashboard-hero">
          <section className="seed-capsule">
            <p className="eyebrow"><span className="live-dot" />LIVE ON STUDIONET</p>
            <h1>Turn culture into a living lineage.</h1>
            <p>Mila lets people launch creative rounds, submit compact seeds, mutate the best ideas, and let GenLayer validators decide what genuinely transforms the thread.</p>
            <div className="hero-cta">
              <Link className="primary-button" href="/rounds/new">
                Create a round <ArrowUpRight size={17} />
              </Link>
              <Link className="text-link" href="/rounds">
                Open an existing round
              </Link>
            </div>
          </section>
          <div className="detail-card">
            <p className="card-kicker">MILA TODAY</p>
            <h2>{summary.entry_count} accepted ideas and attempts across {summary.round_count} live rounds</h2>
            <p>Every entry keeps its parent, creator, judgment, and SPARK trail visible, so a meme, joke, or office-lore riff can show where it came from and how it changed.</p>
            <div className="detail-meta">
              <div><span>Network</span><b>StudioNet</b></div>
              <div><span>Creator reputation</span><b>{summary.badge_count} badges claimed</b></div>
              <div><span>Current epoch</span><b>{summary.epoch}</b></div>
            </div>
          </div>
        </section>
        <section className="round-section">
          <div className="round-grid two-col">
            <div className="detail-card">
              <p className="card-kicker">HOW IT WORKS</p>
              <h2>Seed, mutate, prove the branch.</h2>
              <p>Rounds define the cultural prompt. Seeds start a branch. Mutations must transform an accepted parent. Accepted work earns non-transferable SPARK; duplicates and shallow copies are rejected.</p>
            </div>
            <div className="detail-card">
              <p className="card-kicker">WHY GENLAYER</p>
              <h2>Judgment without a single judge.</h2>
              <p>Mila stores deterministic lineage on-chain, then uses validator consensus for semantic calls like originality, theme fit, safety, and whether a mutation meaningfully extends its parent.</p>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <section className="hero dashboard-hero">
        <SeedCapsule round={previewRound} />
        <CultureDial round={previewRound} />
      </section>
      <section className="round-section">
        <div className="round-grid two-col">
          <LineageWeb entries={previewEntries} />
          <div className="detail-card">
            <p className="card-kicker">PRODUCT PREVIEW</p>
            <h2>Ideas earn provenance.</h2>
            <p>Mila is built for short cultural sparks: one person starts a round, others submit seeds, and every accepted mutation keeps a visible trail back to the original idea.</p>
          </div>
        </div>
      </section>
      <SparkCell entries={previewEntries} />
    </AppShell>
  );
}
