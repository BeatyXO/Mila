import { AppShell } from "../../components/mila-ui";
import { CreateRoundForm } from "../../components/contract-actions";

export default function NewRoundPage() {
  return (
    <AppShell>
      <section className="form-page">
        <p className="eyebrow">CREATE ROUND</p>
        <h1>Lock the next culture dial.</h1>
        <CreateRoundForm />
      </section>
    </AppShell>
  );
}
