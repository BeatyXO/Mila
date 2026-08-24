import { AppShell, LineageWeb } from "../../components/mila-ui";
import { previewEntries } from "../../lib/mila";

export default function LineagePage() {
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
