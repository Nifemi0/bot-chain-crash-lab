"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { CanonicalRun, Simulation, SimulationEvent } from "@/lib/types";

const IMPACT_RIG_URL =
  "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/projects/9ac13d4b-6e2d-43db-ae5d-808eff331873/external-assets/becd4769-0a15-42a8-a8ed-7b71d5f57774-hero-protocol-impact-rig.png";

type Props = {
  network: {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
    nativeCurrency: string;
  };
  contracts: {
    passport: string;
    mockBot: string;
    vulnerableVault: string;
    patchedVault: string | null;
  };
  canonicalRun: CanonicalRun;
  canonicalRunReady: boolean;
};

const shorten = (value: string | null, size = 6) =>
  value ? `${value.slice(0, size + 2)}…${value.slice(-size)}` : "pending";

export function CrashLab({ network, contracts, canonicalRun, canonicalRunReady }: Props) {
  const [address, setAddress] = useState(contracts.vulnerableVault);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [state, setState] = useState<"idle" | "creating" | "streaming" | "complete" | "error">("idle");
  const [message, setMessage] = useState("Canonical demo contract loaded. Ready to replay.");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const streamRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      streamRef.current?.close();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const currentStage = (() => {
    if (events.some((event) => event.type === "replay.completed")) return "replay";
    if (events.some((event) => event.type === "invariant.failed")) return "impact";
    return "attack";
  })();

  const runStatus =
    currentStage === "replay"
      ? "Replay verified"
      : currentStage === "impact"
        ? "Protocol compromised"
        : "Canonical specimen ready";

  async function startSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    streamRef.current?.close();
    setSimulation(null);
    setEvents([]);
    setState("creating");
    setMessage(`Verifying bytecode on ${network.name}…`);

    try {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contractAddress: address }),
      });
      const result = (await response.json()) as Simulation & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Simulation could not be created.");

      setSimulation(result);
      setState("streaming");
      setMessage(`${shorten(result.simulationId, 8)} created. Streaming replay evidence.`);

      const source = new EventSource(result.eventsUrl);
      streamRef.current = source;
      source.onmessage = (streamEvent) => {
        const item = JSON.parse(streamEvent.data) as SimulationEvent;
        setEvents((current) => [...current, item]);
        if (item.type === "simulation.completed") {
          source.close();
          setState("complete");
          setMessage("Replay complete. Evidence package and Passport proof are ready.");
        }
      };
      source.onerror = () => {
        source.close();
        setState("error");
        setMessage("The evidence stream disconnected. Start the replay again.");
      };
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Simulation could not be created.");
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <div className="paper-texture" aria-hidden="true" />

      <header className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="nav-inner section-shell">
          <a className="nav-brand" href="#top" aria-label="BOT Crash Lab home" onClick={closeMenu}>
            <span className="nav-mark" aria-hidden="true" />
            <span className="nav-wordmark">BOT / CRASH LAB</span>
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#simulator">Simulator</a>
            <a href="#passport">Passport</a>
          </nav>

          <div className="nav-actions">
            <button
              className="mobile-nav-toggle"
              type="button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-controls="mobile-nav-panel"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span /><span />
            </button>
            <a className="button button--primary nav-cta" href="#start-simulation" onClick={closeMenu}>
              Start a simulation
            </a>
          </div>
        </div>

        <nav id="mobile-nav-panel" className={`mobile-nav${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation">
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#simulator" onClick={closeMenu}>Simulator</a>
          <a href="#passport" onClick={closeMenu}>Passport</a>
          <a className="mobile-nav__cta" href="#start-simulation" onClick={closeMenu}>Start a simulation</a>
        </nav>
      </header>

      <main>
        <section id="top" className="hero">
          <div className="hero__inner section-shell">
            <div className="hero__copy">
              <p className="hero__meta">
                <span>BOT CHAIN · CHAIN {network.chainId}</span>
                <span><i /> LIVE TESTNET EVIDENCE</span>
              </p>
              <h1>
                <span>Break your</span>
                <span>Protocol before</span>
                <span>Mainnet does.</span>
              </h1>
              <p className="hero__lede">
                Deploy to a controlled adversarial sandbox. Autonomous agent-wallets stress protocol
                accounting until the invariant fractures. Same-attack replay verifies the repair.
              </p>
              <div className="hero__actions">
                <a className="button button--primary" href="#start-simulation">Spawn simulation</a>
                <a className="button button--dark" href="#simulator">Watch a protocol break</a>
              </div>
              <p className="safety-note">Controlled testnet demonstration · never attacks an unrelated live contract</p>
            </div>

            <div className="hero__art" aria-label="Physical protocol impact rig striking a smart-contract vault specimen">
              <Image
                src={IMPACT_RIG_URL}
                alt="Physical protocol impact rig striking a smart-contract vault specimen"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 66vw"
              />
              <div className="specimen-readout">
                <strong>Specimen: V-968</strong>
                <span>Vault: {shorten(contracts.vulnerableVault, 8)}</span>
              </div>
              <div className="calibration-tape" aria-hidden="true">
                <div>
                  <span>AGENT DISPATCHED</span>
                  <span>TRANSACTION EXECUTING</span>
                  <span>INVARIANT MONITORING</span>
                  <span>SAME-ATTACK REPLAY</span>
                  <span>AGENT DISPATCHED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="capability-rail" aria-label="Crash Lab capabilities">
          <div className="section-shell">
            {["Real transactions", "Autonomous agents", "Invariant monitoring", "Same-attack replay"].map((item) => (
              <div key={item}><i />{item}</div>
            ))}
          </div>
        </section>

        <section id="simulator" className="failure-ledger">
          <div className="section-shell">
            <div className="failure-ledger__heading">
              <h2>Inside the test:<span>Canonical run</span></h2>
              <strong className={`run-badge run-badge--${currentStage}`}>{runStatus}</strong>
            </div>

            <div className="ledger-rows" data-stage={currentStage}>
              <article className={currentStage === "attack" ? "is-active" : ""}>
                <div className="ledger-row__phase">01 / Attack</div>
                <div>
                  <h3>Signal-yellow ingress</h3>
                  <p>A one-share holder donates directly into the vulnerable ERC-4626 vault to distort ownership accounting.</p>
                </div>
                <div className="ledger-row__value ledger-row__value--yellow">
                  TX {shorten(canonicalRun.attack.transactionHashes.at(-1) ?? null, 8)} · attacker recovered {canonicalRun.attack.attackerRecoveredAssets} BOT
                </div>
                <i className="ledger-row__light" />
              </article>

              <article className={currentStage === "impact" ? "is-active" : ""}>
                <div className="ledger-row__phase">02 / Impact</div>
                <div>
                  <h3>Invariant fracture</h3>
                  <p>The victim deposit transfers assets but mints no ownership after donation-driven share inflation.</p>
                </div>
                <div className="ledger-row__value ledger-row__value--red">
                  INV-01 FAIL · VICTIM SHARES = {canonicalRun.attack.victimShares}
                </div>
                <i className="ledger-row__light" />
              </article>

              <article className={currentStage === "replay" ? "is-active" : ""}>
                <div className="ledger-row__phase">03 / Replay</div>
                <div>
                  <h3>Verification loop</h3>
                  <p>Virtual liquidity is deployed, then the exact sequence is replayed against the patched universe.</p>
                </div>
                <div className="ledger-row__value ledger-row__value--green">
                  REPLAY SUCCESS · {canonicalRun.replay.victimShares} VICTIM SHARES
                </div>
                <i className="ledger-row__light" />
              </article>
            </div>
          </div>
        </section>

        <section id="start-simulation" className="simulation-section">
          <div className="simulation-stack">
            <div className="simulation-dossier">
              <span className="calibration-tab">{canonicalRunReady ? "Calibration OK" : "Passport pending"}</span>
              <div className="simulation-dossier__intro">
                <p className="eyebrow">Interactive evidence console</p>
                <h2>Ready for the impact?</h2>
                <p>
                  Submit a BOT Chain contract address. The canonical vault receives the complete controlled
                  replay; other addresses are bytecode-verified and are never attacked.
                </p>
              </div>

              <form className="runner__form" onSubmit={startSimulation}>
                <label htmlFor="contract-address">Contract address</label>
                <div className="runner__controls">
                  <input
                    id="contract-address"
                    data-testid="contract-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="ENTER BOT CHAIN ADDRESS (0x...)"
                    spellCheck={false}
                    autoComplete="off"
                    aria-describedby="simulation-status"
                  />
                  <button className="button button--primary" data-testid="start-simulation" disabled={state === "creating" || state === "streaming"}>
                    {state === "creating" ? "Verifying…" : state === "streaming" ? "Replaying…" : "Begin simulation"}
                  </button>
                </div>
                <div className="runner__footer">
                  <button type="button" className="text-button" onClick={() => setAddress(contracts.vulnerableVault)}>
                    Use deployed demo vault
                  </button>
                  <p id="simulation-status" className={`runner__status runner__status--${state}`} role="status" aria-live="polite">{message}</p>
                </div>
              </form>
            </div>

            {(events.length > 0 || simulation) && (
              <div className="console" data-testid="simulation-console">
                <div className="console__header">
                  <span>Crash Lab / live event stream</span>
                  <span>{simulation ? shorten(simulation.simulationId, 8) : "connecting"}</span>
                </div>
                <div className="console__events" aria-live="polite">
                  {events.map((item) => (
                    <p key={`${item.sequence}-${item.type}`} data-event-type={item.type}>
                      <span>{String(item.sequence).padStart(2, "0")}</span>
                      <strong>{item.type}</strong>
                      <em>{item.message}</em>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {simulation && state === "complete" && (
              <article className="finding" data-testid="finding-report">
                <div className="finding__topline">
                  <span>{simulation.finding.id}</span>
                  <strong className={`badge badge--${simulation.finding.status}`}>{simulation.finding.status}</strong>
                </div>
                <h3>{simulation.finding.title}</h3>
                <p>{simulation.finding.summary}</p>
                <dl>
                  <div><dt>Invariant</dt><dd>{simulation.finding.invariant}</dd></div>
                  <div><dt>Before patch</dt><dd>{simulation.finding.beforeVictimShares} victim shares</dd></div>
                  <div><dt>After replay</dt><dd>{simulation.finding.afterVictimShares} victim shares</dd></div>
                  <div><dt>Runtime code hash</dt><dd>{shorten(simulation.codeHash, 12)}</dd></div>
                </dl>
              </article>
            )}

            <article id="passport" className="passport-proof">
              <div className="passport-proof__intro">
                <p className="eyebrow">BOT Chain Simulation Passport</p>
                <h2>Compact proof. On-chain.</h2>
                <p>The Passport anchors this exact source and report; it is evidence of the run, not a blanket safety badge.</p>
              </div>
              <dl>
                <div><dt>Status</dt><dd><i className={canonicalRunReady ? "proof-light proof-light--ok" : "proof-light"} />{canonicalRunReady ? "Anchored" : "Contract live"}</dd></div>
                <div><dt>Passport</dt><dd>{shorten(contracts.passport, 10)}</dd></div>
                <div><dt>Simulation ID</dt><dd>{shorten(canonicalRun.passport.simulationId, 10)}</dd></div>
                <div><dt>Report hash</dt><dd>{shorten(canonicalRun.passport.reportHash, 10)}</dd></div>
                <div><dt>Publisher</dt><dd>{shorten(canonicalRun.passport.publisher, 10)}</dd></div>
              </dl>
              <a className="button button--dark" href={`${network.explorerUrl}/address/${contracts.passport}`} target="_blank" rel="noreferrer">
                Inspect Passport ↗
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-shell site-footer__grid">
          <div className="footer-brand">
            <strong>BOT / CRASH LAB</strong>
            <span>Experimental protocol hardening</span>
            <p>A disciplined environment for adversarial smart-contract stress testing on BOT Chain testnet.</p>
          </div>
          <div className="footer-links">
            <div><strong>Testing</strong><a href="#simulator">Simulator</a><a href="#start-simulation">Replay vault</a><a href="#how-it-works">Agent matrix</a></div>
            <div><strong>Resources</strong><a href="/api/health">API health</a><a href="https://github.com/Nifemi0/bot-chain-crash-lab" target="_blank" rel="noreferrer">GitHub source</a><a href={`${network.explorerUrl}/tx/${canonicalRun.passport.transactionHash}`} target="_blank" rel="noreferrer">Passport tx</a></div>
            <div><strong>Network</strong><span>BOT Chain {network.chainId}</span><a href={network.explorerUrl} target="_blank" rel="noreferrer">BOTScan</a><a href={network.rpcUrl} target="_blank" rel="noreferrer">RPC info</a></div>
            <div><strong>Contracts</strong><a href={`${network.explorerUrl}/address/${contracts.vulnerableVault}`} target="_blank" rel="noreferrer">Vulnerable vault</a><a href={`${network.explorerUrl}/address/${contracts.patchedVault}`} target="_blank" rel="noreferrer">Patched vault</a><a href={`${network.explorerUrl}/address/${contracts.passport}`} target="_blank" rel="noreferrer">Passport</a></div>
          </div>
        </div>
        <div className="section-shell footer-bottom">
          <span>© 2026 CRASH LAB V1 · BOT CHAIN NATIVE · CHAIN {network.chainId}</span>
        </div>
      </footer>
    </div>
  );
}
