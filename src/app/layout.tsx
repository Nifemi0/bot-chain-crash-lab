import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Crash Lab — BOT Chain adversarial simulation",
    template: "%s | Crash Lab",
  },
  description:
    "Reproduce a vault accounting failure, verify the repair, and inspect its on-chain BOT Chain Passport proof.",
  keywords: ["BOT Chain", "smart contract security", "ERC-4626", "hackathon", "simulation"],
  openGraph: {
    title: "Crash Lab",
    description: "Contract → adversarial replay → verified patch → on-chain Passport.",
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
