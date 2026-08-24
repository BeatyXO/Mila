import Link from "next/link";
import { AppShell, CultureDial, ErrorState, LineageWeb } from "../../components/mila-ui";
import { isStudioNetMode } from "../../lib/genlayer";
import { previewEntries, previewRound } from "../../lib/mila";
import { liveEntryToUi, liveRoundToUi, milaReads } from "../../lib/mila-contract";

export default async function RoundDetailPage({ params }: { params: { id: string } }) {
  if (isStudioNetMode()) {
    try {
      const [summary, round, feed] = await Promise.all([milaReads.getSummary(), milaReads.getRound(params.id), milaReads.getRoundFeed(params.id, 0, 20)]);
      const entries = await Promise.all(feed.map(async (entryId) => liveEntryToUi(await milaReads.getEntry(entryId))));
      const uiRound = liveRoundToUi(round, summary.epoch);
      return (
        <AppShell>
          <section className="round-section">
            <div className="section-intro">
              <div><p className="eyebrow">LIVE ROUND</p><h2>{uiRound.prompt}</h2><p>{uiRound.theme}</p></div>
              <Link className="primary-button" href={`/rounds/${params.id}/seed`}>Submit seed</Link>
            </div>
            <div className="round-grid two-col">
              <CultureDial round={uiRound} />
              <LineageWeb entries={entries} />
            </div>
          </section>
        </AppShell>
      );
    } catch (error) {
      return <AppShell><section className="round-section"><ErrorState title={error instanceof Error ? error.message : "Unable to read live round."} /></section></AppShell>;
    }
  }
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
