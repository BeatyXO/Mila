import { AppShell, SparkCell } from "../components/mila-ui";
import { previewEntries } from "../lib/mila";

export default function SparkPage() {
  return <AppShell><SparkCell entries={previewEntries} /></AppShell>;
}
