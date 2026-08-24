import { AppShell, RulebookSheet } from "../../components/mila-ui";
import { previewRound } from "../../lib/mila";

export default function RulesPage() {
  return <AppShell><RulebookSheet round={previewRound} /></AppShell>;
}
