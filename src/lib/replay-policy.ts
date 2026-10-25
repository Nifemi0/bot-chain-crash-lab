// Fixed, project-owned demonstration fixtures only. Never accept caller-supplied targets.
export function isDemoReplayTarget(chainId: number, address: string): boolean {
  return [677, 4663].includes(chainId) && [
    "0x756892f17a7f8d5b870ee2910df610fec2e1930c",
    "0x696a0e79973711bcc89e52edfdba34cea972a6aa",
  ].includes(address.toLowerCase());
}
