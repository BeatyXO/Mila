import { AppShell } from "../../../components/mila-ui";
import { SubmitSeedForm } from "../../../components/contract-actions";

export default function SeedPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <section className="form-page">
        <p className="eyebrow">SUBMIT SEED</p>
        <h1>Start a lineage.</h1>
        <SubmitSeedForm roundId={params.id} />
      </section>
    </AppShell>
  );
}
