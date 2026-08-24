import Link from "next/link";
import { AppShell, CultureDial, LineageWeb } from "../../components/mila-ui";
import { previewEntries, previewRound } from "../../lib/mila";

export default function RoundDetailPage() {
  return (
    <AppShell>
      <section className="round-section">
        <div className="section-intro">
          <div><p className="eyebrow">ROUND DETAIL</p><h2>{previewRound.prompt}</h2><p>All entries are shown as local preview data until contract reads are configured.</p></div>
          <Link className="primary-button" href={`/rounds/${previewRound.id}/seed`}>Submit seed</Link>
        </div>
        <div className="round-grid two-col">
          <CultureDial round={previewRound} />
          <LineageWeb entries={previewEntries} />
        </div>
      </section>
    </AppShell>
  );
}
