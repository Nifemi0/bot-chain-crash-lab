"use client";

import { useEffect } from "react";

const analyzerAnchors = new Set([
  "#start-simulation",
  "#scan-history",
  "#simulator",
  "#demo-lab",
  "#finding-report",
  "#simulation-console",
  "#ai-investigation",
]);

export function LegacyAnalyzerHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (analyzerAnchors.has(hash)) window.location.replace(`/app${hash}`);
  }, []);
  return null;
}
