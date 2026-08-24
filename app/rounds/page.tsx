import Link from "next/link";
import { AppShell, CultureDial, LineageWeb } from "../components/mila-ui";
import { previewEntries, previewRound } from "../lib/mila";

export default function RoundsPage() {
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
