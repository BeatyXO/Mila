import { AppShell, CultureDial, LineageWeb, SeedCapsule, SparkCell, TxStatusDrawer } from "./components/mila-ui";
import { previewEntries, previewRound } from "./lib/mila";

export default function Home() {
  return (
    <AppShell>
      <section className="hero dashboard-hero">
        <SeedCapsule round={previewRound} />
        <CultureDial round={previewRound} />
      </section>
      <section className="round-section">
        <div className="round-grid two-col">
          <LineageWeb entries={previewEntries} />
          <div className="detail-card">
            <p className="card-kicker">EPOCH PRESS</p>
            <h2>Pending lifecycle</h2>
            <p>Connect a StudioNet wallet, submit a seed or mutation, then track pending, accepted, finalized, or undetermined transaction states.</p>
            <TxStatusDrawer />
          </div>
        </div>
      </section>
      <SparkCell entries={previewEntries} />
    </AppShell>
  );
}
