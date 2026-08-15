import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { BOT_CHAIN } from "@/lib/network";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});
const body = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: {
    default: "Crash Lab — BOT Chain contract analyzer",
    template: "%s | Crash Lab",
  },
  description:
    `Inspect live ${BOT_CHAIN.name} contracts using deployed bytecode, read-only interface probes, proxy detection, and opcode surface checks.`,
  keywords: ["BOT Chain", "smart contract security", "bytecode analysis", "contract analyzer", "hackathon"],
  openGraph: {
    title: "Crash Lab",
    description: "Live BOT Chain bytecode and interface analysis with no simulated exploit claims.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Crash Lab" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2eee6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
