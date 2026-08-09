"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { CanonicalRun, Simulation, SimulationEvent } from "@/lib/types";

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
  const streamRef = useRef<EventSource | null>(null);

  useEffect(() => () => streamRef.current?.close(), []);

  const currentStage = (() => {
    if (events.some((event) => event.type === "replay.completed")) return "replay";
    if (events.some((event) => event.type === "invariant.failed")) return "impact";
    return "attack";
  })();

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

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Crash Lab home">Crash Lab</a>
        <nav aria-label="Primary navigation">
          <a href="#workflow">Workflow</a>
          <a href="#evidence">Evidence</a>
          <a href="#passport">Passport</a>
        </nav>
        <a className="button button--small" href="#run">Run demo</a>
      </header>

      <section id="top" className="hero section-shell">
        <div className="hero__copy">
          <p className="eyebrow"><span className="pulse-dot" /> Live on BOT Chain testnet</p>
          <h1>Break the accounting.<br /><em>Prove the repair.</em></h1>
          <p className="hero__lede">
            Crash Lab turns one ERC-4626 failure into a reproducible security dossier: deployed
            bytecode, adversarial transaction evidence, exact patch replay, and an on-chain report hash.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#run">Start canonical replay</a>
            <a className="button button--ghost" href={network.explorerUrl} target="_blank" rel="noreferrer">Open BOTScan ↗</a>
          </div>
          <p className="safety-note">Controlled testnet demonstration. Never attacks an unrelated live contract.</p>
        </div>
        <div className="hero__visual" aria-label="Protocol impact rig visualization">
          <Image
            src="/images/protocol-impact-rig.webp"
            alt="Mechanical protocol impact rig aimed at a smart-contract vault specimen"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
          />
          <div className="hero__readout">
            <span>Specimen / ERC-4626</span>
            <strong>{canonicalRunReady ? "Evidence anchored" : "Preparing canonical run"}</strong>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Deployment status">
        <div><span>Network</span><strong>{network.name}</strong></div>
        <div><span>Chain ID</span><strong>{network.chainId}</strong></div>
        <div><span>Contracts live</span><strong>3 verified bytecodes</strong></div>
        <div><span>Passport</span><strong>{canonicalRunReady ? "On-chain" : "Contract live"}</strong></div>
      </section>

      <section id="workflow" className="workflow section-shell">
        <div className="section-heading">
          <p className="eyebrow">The controlled workflow</p>
          <h2>One exploit. One repair. The exact same replay.</h2>
        </div>
        <div className="workflow-grid">
          <article><span>01</span><h3>Verify</h3><p>Resolve the address against chain 968 and hash its deployed runtime bytecode.</p></article>
          <article><span>02</span><h3>Fracture</h3><p>Replay the first-depositor donation attack and capture the zero-share victim deposit.</p></article>
          <article><span>03</span><h3>Repair</h3><p>Introduce virtual liquidity and reject zero-share deposits without changing the scenario.</p></article>
          <article><span>04</span><h3>Anchor</h3><p>Publish compact source and report hashes to the Simulation Passport contract.</p></article>
        </div>
      </section>

      <section id="evidence" className="ledger-section">
        <div className="section-shell ledger-layout">
          <div className="section-heading section-heading--light">
            <p className="eyebrow">Failure ledger / canonical run</p>
            <h2>Evidence, not a safety badge.</h2>
            <p>The Passport proves a specific report existed. It does not claim that every behavior of a protocol is safe.</p>
          </div>
          <div className="ledger" data-stage={currentStage}>
            <div className="ledger__rail"><i /></div>
            <article className={currentStage === "attack" ? "active" : ""}>
              <span>Attack</span><h3>Share price manipulated</h3><p>A one-unit share holder donates directly into the vault.</p>
            </article>
            <article className={currentStage === "impact" ? "active" : ""}>
              <span>Impact</span><h3>Victim receives zero shares</h3><p>The vulnerable deposit succeeds while transferring all victim assets.</p>
            </article>
            <article className={currentStage === "replay" ? "active" : ""}>
              <span>Replay</span><h3>Invariant restored</h3><p>Virtual assets and shares preserve non-zero ownership in the patched vault.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="run" className="runner section-shell">
        <div className="section-heading">
          <p className="eyebrow">Interactive evidence console</p>
          <h2>Replay the deployed specimen.</h2>
          <p>Use the canonical vault for the complete finding. Other BOT Chain addresses are bytecode-verified but never attacked by this MVP.</p>
        </div>
        <form className="runner__form" onSubmit={startSimulation}>
          <label htmlFor="contract-address">BOT Chain testnet contract</label>
          <div className="runner__controls">
            <input
              id="contract-address"
              data-testid="contract-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="0x…"
              spellCheck={false}
              autoComplete="off"
              aria-describedby="simulation-status"
            />
            <button className="button button--primary" data-testid="start-simulation" disabled={state === "creating" || state === "streaming"}>
              {state === "creating" ? "Verifying…" : state === "streaming" ? "Replaying…" : "Begin replay"}
            </button>
          </div>
          <button type="button" className="text-button" onClick={() => setAddress(contracts.vulnerableVault)}>Use deployed demo vault</button>
          <p id="simulation-status" className={`runner__status runner__status--${state}`} role="status" aria-live="polite">{message}</p>
        </form>

        {(events.length > 0 || simulation) && (
          <div className="console" data-testid="simulation-console">
            <div className="console__header"><span>Crash Lab / event stream</span><span>{simulation ? shorten(simulation.simulationId, 8) : "connecting"}</span></div>
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
      </section>

      <section id="passport" className="passport-section">
        <div className="section-shell passport-grid">
          <div className="section-heading">
            <p className="eyebrow">BOT Chain Simulation Passport</p>
            <h2>A compact proof lives on-chain.</h2>
            <p>Detailed exploit traces stay off-chain. The Passport stores the target, source hash, report hash, status, timestamp, tool version, and publisher.</p>
          </div>
          <article className="passport-card">
            <div className="passport-card__status"><span className={canonicalRunReady ? "status-light status-light--ok" : "status-light"} />{canonicalRunReady ? "Anchored" : "Contract deployed"}</div>
            <dl>
              <div><dt>Passport contract</dt><dd>{shorten(contracts.passport, 10)}</dd></div>
              <div><dt>Simulation ID</dt><dd>{shorten(canonicalRun.passport.simulationId, 10)}</dd></div>
              <div><dt>Report hash</dt><dd>{shorten(canonicalRun.passport.reportHash, 10)}</dd></div>
              <div><dt>Publisher</dt><dd>{shorten(canonicalRun.passport.publisher, 10)}</dd></div>
            </dl>
            <a className="button button--dark" href={`${network.explorerUrl}/address/${contracts.passport}`} target="_blank" rel="noreferrer">Inspect contract ↗</a>
          </article>
        </div>
      </section>

      <footer>
        <strong>Crash Lab</strong>
        <p>Built for BOT Chain · deterministic security evidence · testnet chain {network.chainId}</p>
        <div><a href="/api/health">API health</a><a href={network.explorerUrl} target="_blank" rel="noreferrer">BOTScan</a></div>
      </footer>
    </main>
  );
}
