import Link from "next/link";
import { AppShell, ErrorState, JudgmentBreakdown } from "../../components/mila-ui";
import { JudgeEntryButton } from "../../components/contract-actions";
import { getChildren, getEntry } from "../../lib/mila";

export default function EntryPage({ params }: { params: { id: string } }) {
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
