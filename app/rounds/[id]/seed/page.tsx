import { AppShell } from "../../../components/mila-ui";

export default function SeedPage() {
  return (
    <AppShell>
      <section className="form-page">
        <p className="eyebrow">SUBMIT SEED</p>
        <h1>Start a lineage.</h1>
        <label>Seed title<input placeholder="A compact culture hook" /></label>
        <label>Seed text<textarea placeholder="The premise, caption, or setup" /></label>
        <label>Evidence URL<input placeholder="Optional allowlisted source" /></label>
        <button className="primary-button">Connect wallet to submit seed</button>
      </section>
    </AppShell>
  );
}
