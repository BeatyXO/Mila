import { AppShell, SparkCell } from "../components/mila-ui";
import { isStudioNetMode } from "../lib/genlayer";
import { previewEntries } from "../lib/mila";
import { milaReads } from "../lib/mila-contract";

export default async function SparkPage() {
  if (isStudioNetMode()) {
    const summary = await milaReads.getSummary();
    return (
      <AppShell>
        <section className="spark-section">
          <div>
            <p className="eyebrow">LIVE SPARK CELL</p>
            <h2>Contribution, made visible.</h2>
            <p>SPARK is non-transferable protocol state for accepted creative contribution. Creator-specific balances are available at /creators/&lt;address&gt;.</p>
          </div>
          <div className="spark-stat"><span>LIVE ENTRIES</span><strong>{summary.entry_count}</strong><small>StudioNet contract state</small></div>
          <div className="spark-stat"><span>BADGES</span><strong>{summary.badge_count}</strong><small>claimed creator badges</small></div>
          <div className="spark-footer"><span><b>EPOCH</b> {summary.epoch}</span><span><b>POLICY</b> {summary.policy_version}</span><span><b>DECAY</b> 5% / epoch</span></div>
        </section>
      </AppShell>
    );
  }
  return <AppShell><SparkCell entries={previewEntries} /></AppShell>;
}
