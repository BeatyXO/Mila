import { AppShell, ErrorState, LineageWeb } from "../../components/mila-ui";
import { isStudioNetMode } from "../../lib/genlayer";
import { previewEntries } from "../../lib/mila";
import { liveEntryToUi, milaReads } from "../../lib/mila-contract";

export default async function LineagePage({ params }: { params: { id: string } }) {
  if (isStudioNetMode()) {
    try {
      const lineage = await milaReads.getLineage(params.id);
      const entries = await Promise.all(lineage.map(async (entryId) => liveEntryToUi(await milaReads.getEntry(entryId))));
      return (
        <AppShell>
          <section className="round-section">
            <div className="section-intro">
              <div><p className="eyebrow">LIVE LINEAGE</p><h2>Lineage explorer</h2><p>Showing the on-chain ancestor path for {params.id}.</p></div>
            </div>
            <LineageWeb entries={entries} />
          </section>
        </AppShell>
      );
    } catch (error) {
      return <AppShell><section className="round-section"><ErrorState title={error instanceof Error ? error.message : "Unable to read live lineage."} /></section></AppShell>;
    }
  }
  return (
    <AppShell>
      <section className="round-section">
        <div className="section-intro">
          <div><p className="eyebrow">LINEAGE</p><h2>Lineage explorer</h2><p>Parent and child links are kept explicit so every mutation has provenance.</p></div>
        </div>
        <LineageWeb entries={previewEntries} />
      </section>
    </AppShell>
  );
}
