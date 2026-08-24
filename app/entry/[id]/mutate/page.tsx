import { AppShell } from "../../../components/mila-ui";

export default function MutatePage() {
  return (
    <AppShell>
      <section className="form-page">
        <p className="eyebrow">SUBMIT MUTATION</p>
        <h1>Transform the parent.</h1>
        <label>Mutation title<input placeholder="The next beat" /></label>
        <label>Mutation text<textarea placeholder="The twist, callback, or remix" /></label>
        <label>Parent fit note<textarea placeholder="Why this meaningfully transforms its parent" /></label>
        <button className="primary-button">Connect wallet to request judgment</button>
      </section>
    </AppShell>
  );
}
