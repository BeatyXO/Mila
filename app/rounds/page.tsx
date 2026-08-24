import Link from "next/link";
import { AppShell, CultureDial, EmptyState, LineageWeb } from "../components/mila-ui";
import { isStudioNetMode } from "../lib/genlayer";
import { previewEntries, previewRound } from "../lib/mila";
import { milaReads } from "../lib/mila-contract";

export default async function RoundsPage() {
  if (isStudioNetMode()) {
    const summary = await milaReads.getSummary();
    return (
      <AppShell>
        <section className="round-section">
          <div className="section-intro">
            <div>
              <p className="eyebrow">LIVE ROUNDS</p>
              <h2>{summary.round_count} rounds on StudioNet</h2>
              <p>Open a round by its returned round id from a create-round transaction or LIVE_PROOF.md.</p>
            </div>
            <div className="round-meta">
              <span><b>{summary.epoch}</b> epoch</span>
              <span><b>{summary.entry_count}</b> entries</span>
              <span><b>{summary.badge_count}</b> badges</span>
            </div>
          </div>
          <EmptyState title="StudioNet mode does not show preview rounds. Use /rounds/{roundId} for a live round." />
          <Link className="primary-button route-action" href="/rounds/new">Create live round</Link>
        </section>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <section className="round-section">
        <div className="section-intro">
          <div>
            <p className="eyebrow">ROUNDS</p>
            <h2>{previewRound.theme}</h2>
            <p>{previewRound.prompt}</p>
          </div>
          <div className="round-meta">
            <span><b>{previewRound.epoch}</b> epoch</span>
            <span><b>{previewRound.status}</b> status</span>
            <span><b>{previewEntries.length}</b> entries</span>
          </div>
        </div>
        <div className="round-grid two-col">
          <CultureDial round={previewRound} />
          <LineageWeb entries={previewEntries} />
        </div>
        <Link className="primary-button route-action" href={`/rounds/${previewRound.id}/seed`}>Start seed</Link>
      </section>
    </AppShell>
  );
}
