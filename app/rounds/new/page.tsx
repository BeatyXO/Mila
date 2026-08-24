import { AppShell } from "../../components/mila-ui";

export default function NewRoundPage() {
  return (
    <AppShell>
      <section className="form-page">
        <p className="eyebrow">CREATE ROUND</p>
        <h1>Lock the next culture dial.</h1>
        <label>Theme<input placeholder="Office lore" /></label>
        <label>Prompt<textarea placeholder="The seed premise for the round" /></label>
        <label>Max depth<input type="number" defaultValue={4} /></label>
        <button className="primary-button">Connect wallet to create round</button>
      </section>
    </AppShell>
  );
}
