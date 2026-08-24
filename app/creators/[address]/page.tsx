import { AppShell, SparkCell } from "../../components/mila-ui";
import { previewEntries } from "../../lib/mila";

export default function CreatorPage({ params }: { params: { address: string } }) {
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
