import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Mila — Culture mutates on-chain", description: "A culture round where every mutation has lineage, context, and a consensus record." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
