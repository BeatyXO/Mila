import { AppShell } from "../../../components/mila-ui";
import { SubmitMutationForm } from "../../../components/contract-actions";

export default function MutatePage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <section className="form-page">
        <p className="eyebrow">SUBMIT MUTATION</p>
        <h1>Transform the parent.</h1>
        <SubmitMutationForm parentId={params.id} />
      </section>
    </AppShell>
  );
}
