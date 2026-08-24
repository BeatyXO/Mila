import { AppShell, CultureDial, LineageWeb, SeedCapsule, SparkCell, TxStatusDrawer } from "./components/mila-ui";
import { isStudioNetMode } from "./lib/genlayer";
import { previewEntries, previewRound } from "./lib/mila";
import { liveRoundToUi, milaReads } from "./lib/mila-contract";

export default async function Home() {
  if (isStudioNetMode()) {
    const summary = await milaReads.getSummary();
    const round = liveRoundToUi({
      id: "live",
      owner: summary.admin,
      theme: "StudioNet live",
      prompt: "Mila is connected to its deployed GenLayer contract.",
      opens_at: 0,
      closes_at: 0,
      max_depth: 0,
      seed_cap: 0,
      mutation_cap: 0,
      status: "OPEN",
      policy_version: summary.policy_version,
    }, summary.epoch);
    return (
      <AppShell>
        <section className="hero dashboard-hero">
          <SeedCapsule round={round} />
          <div className="detail-card">
            <p className="card-kicker">LIVE CONTRACT</p>
            <h2>{summary.entry_count} entries across {summary.round_count} rounds</h2>
            <p>Schema {summary.schema_version}. Policy {summary.policy_version}. Badge count {summary.badge_count}.</p>
            <TxStatusDrawer />
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
            <p className="card-kicker">EPOCH PRESS</p>
            <h2>Pending lifecycle</h2>
            <p>Connect a StudioNet wallet, submit a seed or mutation, then track pending, accepted, finalized, or undetermined transaction states.</p>
            <TxStatusDrawer />
          </div>
        </div>
      </section>
      <SparkCell entries={previewEntries} />
    </AppShell>
  );
}
