import type { Metadata, Viewport } from "next";
import { Bangers, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { BOT_CHAIN } from "@/lib/network";
import "./globals.css";
import "./fathefe.css";

const display = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
  themeColor: "#6db3e8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
