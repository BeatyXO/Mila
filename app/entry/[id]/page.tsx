import Link from "next/link";
import { AppShell, ErrorState, JudgmentBreakdown } from "../../components/mila-ui";
import { JudgeEntryButton } from "../../components/contract-actions";
import { isStudioNetMode } from "../../lib/genlayer";
import { getChildren, getEntry } from "../../lib/mila";
import { liveEntryToUi, milaReads } from "../../lib/mila-contract";

export default async function EntryPage({ params }: { params: { id: string } }) {
  if (isStudioNetMode()) {
    try {
      const [entry, judgment, childrenIds] = await Promise.all([
        milaReads.getEntry(params.id),
        milaReads.getJudgment(params.id).catch(() => undefined),
        milaReads.getChildren(params.id, 0, 20),
      ]);
      const children = await Promise.all(childrenIds.map(async (childId) => liveEntryToUi(await milaReads.getEntry(childId))));
      const uiEntry = liveEntryToUi(entry, judgment);
      return (
        <AppShell>
          <section className="round-section">
            <div className="section-intro">
              <div><p className="eyebrow">LIVE ENTRY</p><h2>{uiEntry.title}</h2><p>{uiEntry.text}</p></div>
              <div className="hero-cta"><Link className="primary-button" href={`/entry/${uiEntry.id}/mutate`}>Mutate entry</Link><JudgeEntryButton entryId={uiEntry.id} /></div>
            </div>
            <div className="round-grid two-col">
              <JudgmentBreakdown entry={uiEntry} />
              <div className="detail-card">
                <p className="card-kicker">CHILDREN</p>
                {children.length ? children.map((child) => <Link className="lineage-node" key={child.id} href={`/entry/${child.id}`}><strong>{child.title}</strong><small>{child.text}</small></Link>) : <p>No children yet.</p>}
              </div>
            </div>
          </section>
        </AppShell>
      );
    } catch (error) {
      return <AppShell><section className="round-section"><ErrorState title={error instanceof Error ? error.message : "Unable to read live entry."} /></section></AppShell>;
    }
  }
  const entry = getEntry(params.id);
  if (!entry) return <AppShell><section className="round-section"><ErrorState title="Entry not found in local preview data." /></section></AppShell>;
  const children = getChildren(entry.id);
  return (
    <AppShell>
      <section className="round-section">
        <div className="section-intro">
          <div><p className="eyebrow">ENTRY</p><h2>{entry.title}</h2><p>{entry.text}</p></div>
          <div className="hero-cta"><Link className="primary-button" href={`/entry/${entry.id}/mutate`}>Mutate entry</Link><JudgeEntryButton entryId={entry.id} /></div>
        </div>
        <div className="round-grid two-col">
          <JudgmentBreakdown entry={entry} />
          <div className="detail-card">
            <p className="card-kicker">CHILDREN</p>
            {children.length ? children.map((child) => <Link className="lineage-node" key={child.id} href={`/entry/${child.id}`}><strong>{child.title}</strong><small>{child.text}</small></Link>) : <p>No children yet.</p>}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
