import { AppShell, ErrorState, SparkCell } from "../../components/mila-ui";
import { isStudioNetMode } from "../../lib/genlayer";
import { previewEntries } from "../../lib/mila";
import { liveEntryToUi, milaReads, toNumber } from "../../lib/mila-contract";

export default async function CreatorPage({ params }: { params: { address: `0x${string}` } }) {
  if (isStudioNetMode()) {
    try {
      const [spark, history] = await Promise.all([milaReads.getCreatorSpark(params.address), milaReads.getCreatorHistory(params.address, 0, 20)]);
      const entries = await Promise.all(history.map(async (entryId) => liveEntryToUi(await milaReads.getEntry(entryId), undefined, toNumber(spark))));
      return (
        <AppShell>
          <section className="round-section">
            <div className="section-intro">
              <div><p className="eyebrow">LIVE CREATOR</p><h2>{params.address}</h2><p>{history.length} on-chain entries. Current decayed SPARK: {String(spark)}.</p></div>
            </div>
          </section>
          <SparkCell entries={entries} />
        </AppShell>
      );
    } catch (error) {
      return <AppShell><section className="round-section"><ErrorState title={error instanceof Error ? error.message : "Unable to read live creator."} /></section></AppShell>;
    }
  }
  const entries = previewEntries.filter((entry) => entry.creator.toLowerCase() === params.address.toLowerCase());
  return (
    <AppShell>
      <section className="round-section">
        <div className="section-intro">
          <div><p className="eyebrow">CREATOR</p><h2>{params.address}</h2><p>{entries.length} local preview entries for this creator.</p></div>
        </div>
      </section>
      <SparkCell entries={entries.length ? entries : previewEntries} />
    </AppShell>
  );
}
