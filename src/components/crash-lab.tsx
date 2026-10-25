"use client";

import Image from "next/image";
import { isDemoReplayTarget } from "@/lib/replay-policy";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserProvider, type Eip1193Provider } from "ethers";
import { createAttestationData } from "@/lib/attestation";
import type { AiInvestigation, CanonicalRun, ForkReplay, Simulation, SimulationEvent } from "@/lib/types";


type Props = {
  network: {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
    nativeCurrency: string;
  };
  contracts: {
    vulnerableVault: string;
    patchedVault: string;
    passport: string;
  };
  networks: Props["network"][];
  networkContracts: Props["contracts"][];
  canonicalRun: CanonicalRun;
  canonicalRunReady: boolean;
  robinhoodRun: CanonicalRun;
  robinhoodRunReady: boolean;
};

const shorten = (value: string | null, size = 6) =>
  value ? `${value.slice(0, size + 2)}…${value.slice(-size)}` : "pending";

type WalletState = "idle" | "connecting" | "connected" | "switching" | "signing" | "confirming" | "confirmed" | "error";

function injectedWallet() {
  return (window as Window & { ethereum?: Eip1193Provider }).ethereum;
}

export function CrashLab({ network: initialNetwork, contracts: initialContracts, networks, networkContracts, canonicalRun: botCanonicalRun, canonicalRunReady: botRunReady, robinhoodRun, robinhoodRunReady }: Props) {
  const [network, setNetwork] = useState<Props["network"]>(initialNetwork);
  const [contracts, setContracts] = useState<Props["contracts"]>(initialContracts);
  const canonicalRun = network.chainId === 4663 ? robinhoodRun : botCanonicalRun;
  const canonicalRunReady = network.chainId === 4663 ? robinhoodRunReady : botRunReady;
  const canonicalMatchesNetwork = canonicalRun.network.chainId === network.chainId;
  const [address, setAddress] = useState(contracts.vulnerableVault);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [history, setHistory] = useState<Simulation[]>([]);
  const [historyState, setHistoryState] = useState<"loading" | "ready" | "error">("loading");
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [aiInvestigation, setAiInvestigation] = useState<AiInvestigation | null>(null);
  const [aiState, setAiState] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [aiMessage, setAiMessage] = useState("The agent will choose read-only probes and cite every observation.");
  const [forkReplay, setForkReplay] = useState<ForkReplay | null>(null);
  const [forkState, setForkState] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [forkMessage, setForkMessage] = useState("Run the donation-inflation scenario on an isolated chain fork. No mainnet transactions are sent.");
  const [state, setState] = useState<"idle" | "creating" | "streaming" | "complete" | "error">("idle");
  const [message, setMessage] = useState(`Reference contract loaded. Analysis uses live ${network.name} data only.`);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletState, setWalletState] = useState<WalletState>("idle");
  const [walletMessage, setWalletMessage] = useState(`Connect a wallet to anchor an AI report hash on ${network.name}.`);
  const [attestationHash, setAttestationHash] = useState<string | null>(null);
  const [attestationReportHash, setAttestationReportHash] = useState<string | null>(null);
  const streamRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let active = true;
    const onScroll = () => setScrolled(window.scrollY > 36);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    fetch("/api/simulations?limit=30", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("History request failed.");
        return (await response.json()) as { simulations: Simulation[] };
      })
      .then((result) => {
        if (!active) return;
        setHistory(result.simulations);
        setHistoryState("ready");
      })
      .catch(() => {
        if (active) setHistoryState("error");
      });
    return () => {
      active = false;
      streamRef.current?.close();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  async function startSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    streamRef.current?.close();
    setSimulation(null);
    setEvents([]);
    setAiInvestigation(null);
    setAiState("idle");
    setForkReplay(null);
    setForkState("idle");
    setState("creating");
    setMessage(`Verifying bytecode on ${network.name}…`);

    try {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contractAddress: address, chainId: network.chainId }),
      });
      const result = (await response.json()) as Simulation & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Analysis could not be created.");

      setSimulation(result);
      setAiInvestigation(result.aiInvestigation ?? null);
      setAiState(result.aiInvestigation ? "complete" : "idle");
      setForkReplay(result.forkReplay ?? null);
      setForkState(result.forkReplay ? "complete" : "idle");
      setHistory((current) => [
        result,
        ...current.filter((item) => item.simulationId !== result.simulationId),
      ].slice(0, 30));
      setHistoryState("ready");
      setState("streaming");
      setMessage(`${shorten(result.simulationId, 8)} created. Streaming live read-only analysis.`);

      const source = new EventSource(result.eventsUrl);
      streamRef.current = source;
      source.onmessage = (streamEvent) => {
        const item = JSON.parse(streamEvent.data) as SimulationEvent;
        setEvents((current) => [...current, item]);
        if (item.type === "simulation.completed") {
          source.close();
          setState("complete");
          setMessage("Live analysis complete. Review surfaced capabilities and cautions below.");
        }
      };
      source.onerror = () => {
        source.close();
        setState("error");
        setMessage("The evidence stream disconnected. Start the analysis again.");
      };
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Analysis could not be created.");
    }
  }

  const closeMenu = () => setMenuOpen(false);

  function selectChain(chainId: number) {
    const index = networks.findIndex((item) => item.chainId === chainId);
    if (index < 0 || network.chainId === chainId) return;
    streamRef.current?.close();
    setNetwork(networks[index]);
    setContracts(networkContracts[index]);
    setAddress(networkContracts[index].vulnerableVault);
    setSimulation(null);
    setEvents([]);
    setAiInvestigation(null);
    setAiState("idle");
    setForkReplay(null);
    setForkState("idle");
    setState("idle");
    setWalletAddress(null);
    setWalletState("idle");
    setAttestationHash(null);
    setAttestationReportHash(null);
    setMessage(`Reference contract loaded. Analysis uses live ${networks[index].name} data.`);
    setMenuOpen(false);
  }

  function openSavedSimulation(saved: Simulation) {
    selectChain(saved.chainId);
    streamRef.current?.close();
    setAddress(saved.contractAddress);
    setSimulation(saved);
    setAiInvestigation(saved.aiInvestigation ?? null);
    setAiState(saved.aiInvestigation ? "complete" : "idle");
    setForkReplay(saved.forkReplay ?? null);
    setForkState(saved.forkReplay ? "complete" : "idle");
    setEvents([]);
    setState("complete");
    setMessage(`${shorten(saved.simulationId, 8)} reopened from private analysis history.`);
  }

  async function runAiInvestigation() {
    if (!simulation) return;
    setAiState("running");
    setAiMessage(`DeepSeek V4 Flash is selecting and running read-only ${network.name} probes…`);
    try {
      const response = await fetch("/api/ai/investigations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ simulationId: simulation.simulationId }),
      });
      const result = (await response.json()) as {
        investigation?: AiInvestigation;
        sessionRemaining?: number | null;
        cached?: boolean;
        error?: string;
      };
      if (!response.ok || !result.investigation) {
        throw new Error(result.error ?? "AI investigation could not be completed.");
      }
      setAiInvestigation(result.investigation);
      setSimulation((current) => current ? { ...current, aiInvestigation: result.investigation } : current);
      setHistory((current) => current.map((item) =>
        item.simulationId === simulation.simulationId
          ? { ...item, aiInvestigation: result.investigation }
          : item,
      ));
      setAiState("complete");
      setAiMessage(
        result.cached
          ? "Private AI investigation reopened from saved history."
          : `AI investigation complete · ${result.sessionRemaining ?? 0} run${result.sessionRemaining === 1 ? "" : "s"} remaining today.`,
      );
    } catch (error) {
      setAiState("error");
      setAiMessage(error instanceof Error ? error.message : "AI investigation could not be completed.");
    }
  }

  async function runForkReplay() {
    if (!simulation) return;
    setForkState("running");
    setForkMessage("Starting an isolated fork and executing the ERC-4626 donation scenario. This can take a few minutes…");
    try {
      const response = await fetch("/api/fork-replays", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ simulationId: simulation.simulationId }),
      });
      const result = (await response.json()) as { replay?: ForkReplay; error?: string };
      if (!response.ok || !result.replay) throw new Error(result.error ?? "Fork replay did not complete.");
      setForkReplay(result.replay);
      setSimulation((current) => current ? { ...current, forkReplay: result.replay } : current);
      setHistory((current) => current.map((item) => item.simulationId === simulation.simulationId
        ? { ...item, forkReplay: result.replay } : item));
      setForkState("complete");
      setForkMessage("Fork replay complete. Only transactions inside the isolated fork were executed.");
    } catch (error) {
      setForkState("error");
      setForkMessage(error instanceof Error ? error.message : "Fork replay did not complete.");
    }
  }

  async function ensureBotChainWallet() {
    const injected = injectedWallet();
    if (!injected) throw new Error("No injected wallet found. Install or open an EVM wallet, then try again.");

    const requested = await injected.request({ method: "eth_requestAccounts" }) as string[];
    if (!requested[0]) throw new Error("The wallet did not return an account.");

    const currentChainId = Number(await injected.request({ method: "eth_chainId" }));
    if (currentChainId !== network.chainId) {
      setWalletState("switching");
      setWalletMessage(`Switching the wallet to ${network.name}…`);
      const chainId = `0x${network.chainId.toString(16)}`;
      try {
        await injected.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
      } catch (error) {
        const code = (error as { code?: number }).code;
        if (code !== 4902) throw error;
        await injected.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId,
            chainName: network.name,
            nativeCurrency: { name: network.nativeCurrency, symbol: network.nativeCurrency, decimals: 18 },
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.explorerUrl],
          }],
        });
      }
    }

    const provider = new BrowserProvider(injected);
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    setWalletAddress(account);
    return { signer, account };
  }

  async function connectWallet() {
    setWalletState("connecting");
    setWalletMessage("Requesting wallet connection…");
    try {
      const { account } = await ensureBotChainWallet();
      setWalletState("connected");
      setWalletMessage(`${shorten(account, 8)} connected on ${network.name}.`);
    } catch (error) {
      setWalletState("error");
      setWalletMessage(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }

  async function anchorAiReport() {
    if (!simulation || !aiInvestigation) return;
    setWalletState("signing");
    setWalletMessage("Review the zero-value attestation transaction in your wallet.");
    try {
      const { signer, account } = await ensureBotChainWallet();
      const attestation = createAttestationData(simulation, aiInvestigation);
      const transaction = await signer.sendTransaction({ to: account, value: 0n, data: attestation.data });
      setWalletState("confirming");
      setWalletMessage(`${shorten(transaction.hash, 10)} submitted. Waiting for ${network.name} confirmation…`);
      await transaction.wait(1);
      setAttestationHash(transaction.hash);
      setAttestationReportHash(attestation.aiReportHash);
      setWalletState("confirmed");
      setWalletMessage(`AI report hash anchored on ${network.name}. The transaction is public proof of this exact report.`);
    } catch (error) {
      setWalletState("error");
      setWalletMessage(error instanceof Error ? error.message : "The attestation transaction failed.");
    }
  }

  return (
    <div className="app-shell workspace-redesign">
      <div className="paper-texture" aria-hidden="true" />

      <header className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="nav-inner section-shell">
          <a className="nav-brand" href="#top" aria-label="Crash Lab home" onClick={closeMenu}>
            <Image className="nav-mark" src="/images/crash-lab-mark.png" alt="" width={42} height={42} priority />
            <span className="nav-wordmark">CRASH LAB</span>
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#start-simulation">Analyze</a>
            <a href="#scan-history">History</a>
            <a href="#demo-lab">Demo Lab</a>
            <a href="#passport">Passport</a>
          </nav>

          <div className="nav-actions">
            <label className="chain-picker">
              <span className="sr-only">Choose network</span>
              <select aria-label="Choose network" value={network.chainId} onChange={(event) => selectChain(Number(event.target.value))}>
                {networks.map((item) => <option key={item.chainId} value={item.chainId}>{item.name}</option>)}
              </select>
            </label>
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
              Analyze a contract
            </a>
            <button className="wallet-chip" type="button" onClick={connectWallet} disabled={walletState === "connecting" || walletState === "switching"}>
              {walletAddress ? shorten(walletAddress, 5) : "Connect wallet"}
            </button>
          </div>
        </div>

        <nav id="mobile-nav-panel" className={`mobile-nav${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation">
          <label className="mobile-nav__chain">
            <span>Network</span>
            <select aria-label="Choose network on mobile" value={network.chainId} onChange={(event) => selectChain(Number(event.target.value))}>
              {networks.map((item) => <option key={item.chainId} value={item.chainId}>{item.name}</option>)}
            </select>
          </label>
          <a href="#start-simulation" onClick={closeMenu}>Analyze a contract</a>
          <a href="#scan-history" onClick={closeMenu}>Saved scans</a>
          <a href="#demo-lab" onClick={closeMenu}>Demo Lab</a>
          <a href="#passport" onClick={closeMenu}>Passport</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <button type="button" className="mobile-nav__wallet" onClick={() => { closeMenu(); void connectWallet(); }}>
            {walletAddress ? `Wallet ${shorten(walletAddress, 5)}` : "Connect wallet"}
          </button>
        </nav>
        {walletState !== "idle" && (
          <p className={`wallet-toast wallet-toast--${walletState}`} role="status" aria-live="polite">{walletMessage}</p>
        )}
      </header>

      <main>
        <section id="top" className="hero">
          <div className="hero__inner section-shell">
            <div className="hero__copy">
              <p className="hero__meta">
                <span>{network.name.toUpperCase()} · CHAIN {network.chainId}</span>
                <span><i /> LIVE {network.name.toUpperCase()} EVIDENCE</span>
              </p>
              <h1>
                <span>Understand the contract.</span>
                <span>Follow the evidence.</span>
              </h1>
              <p className="hero__lede">
                Your workspace for live contract analysis, evidence-backed AI reviews, and verifiable on-chain reports.
              </p>
              <div className="hero__actions">
                <a className="button button--primary" href="#start-simulation">Analyze contract</a>
                <a className="button button--dark" href="#simulator">See how evidence is collected</a>
              </div>
              <p className="safety-note">Live scans are read-only · fork transactions never reach mainnet · wallet attestations are optional</p>
            </div>

            <aside className="workspace-summary" aria-label="Workspace summary">
              <p className="eyebrow">Your workspace</p>
              <strong>{network.name}</strong>
              <dl>
                <div><dt>Saved analyses</dt><dd>{historyState === "ready" ? history.filter((item) => item.chainId === network.chainId).length : "—"}</dd></div>
                <div><dt>Wallet</dt><dd>{walletAddress ? shorten(walletAddress, 4) : "Not connected"}</dd></div>
                <div><dt>Analysis mode</dt><dd>Read-only</dd></div>
              </dl>
              <p>Start with an address. Connect your wallet when you are ready to anchor a report.</p>
            </aside>
          </div>
        </section>

        <section id="how-it-works" className="capability-rail" aria-label="Crash Lab capabilities">
          <div className="section-shell">
            {["Live bytecode retrieval", "Interface classification", "Proxy detection", "Isolated vault replay"].map((item) => (
              <div key={item}><i />{item}</div>
            ))}
          </div>
        </section>

        <section id="simulator" className="failure-ledger">
          <div className="section-shell">
            <div className="failure-ledger__heading">
              <h2>Inside the analysis:<span>Live evidence</span></h2>
              <strong className="run-badge run-badge--replay">SCAN + FORK</strong>
            </div>

            <div className="ledger-rows" data-stage="replay">
              <article className="is-active">
                <div className="ledger-row__phase">Runtime</div>
                <div>
                  <h3>Deployed bytecode</h3>
                  <p>The analyzer retrieves the exact runtime code currently stored at the submitted {network.name} address.</p>
                </div>
                <div className="ledger-row__value ledger-row__value--yellow">
                  ETH_GETCODE · LIVE RPC
                </div>
                <i className="ledger-row__light" />
              </article>

              <article>
                <div className="ledger-row__phase">Interfaces</div>
                <div>
                  <h3>Read-only probes</h3>
                  <p>Standard interface calls and the EIP-1967 implementation slot are checked without submitting a transaction.</p>
                </div>
                <div className="ledger-row__value ledger-row__value--red">
                  ETH_CALL · STORAGE READ
                </div>
                <i className="ledger-row__light" />
              </article>

              <article>
                <div className="ledger-row__phase">Report</div>
                <div>
                  <h3>Evidence, not guesses</h3>
                  <p>Capabilities and cautionary opcodes are reported as review targets, never as automatically proven exploits.</p>
                </div>
                <div className="ledger-row__value ledger-row__value--green">
                  READ-ONLY BASELINE
                </div>
                <i className="ledger-row__light" />
              </article>
            </div>
          </div>
        </section>

        <section id="start-simulation" className="simulation-section">
          <div className="simulation-stack">
            <nav className="workspace-nav" aria-label="Analysis workspace">
              <a href="#start-simulation"><span>Analyze</span><small>Check a contract address</small></a>
              <a href="#scan-history"><span>History</span><small>Reopen a private scan</small></a>
              <a href="#demo-lab"><span>Demo Lab</span><small>Explore our sample vaults</small></a>
              <a href="#passport"><span>Passport</span><small>Inspect on-chain evidence</small></a>
            </nav>
            <div className="simulation-dossier">
              <span className="calibration-tab">LIVE RPC</span>
              <div className="simulation-dossier__intro">
                <p className="eyebrow">Interactive evidence console</p>
                <h2>Inspect a deployed contract</h2>
                <p>
                  Submit any deployed {network.name} address for a read-only surface analysis. Crash Lab&apos;s fixed demo vaults
                  also support a controlled demonstration on an isolated chain fork.
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
                    placeholder={`ENTER ${network.name.toUpperCase()} ADDRESS (0x...)`}
                    spellCheck={false}
                    autoComplete="off"
                    aria-describedby="simulation-status"
                  />
                  <button className="button button--primary" data-testid="start-simulation" disabled={state === "creating" || state === "streaming"}>
                    {state === "creating" ? "Inspecting…" : state === "streaming" ? "Analyzing…" : "Analyze contract"}
                  </button>
                </div>
                <div className="runner__footer">
                  <div id="demo-lab" className="runner__examples">
                    <button type="button" className="text-button" onClick={() => setAddress(contracts.vulnerableVault)}>
                      Use deployed reference contract
                    </button>
                    <button type="button" className="text-button" onClick={() => setAddress(contracts.patchedVault)}>
                      Compare patched vault
                    </button>
                  </div>
                  <p id="simulation-status" className={`runner__status runner__status--${state}`} role="status" aria-live="polite">{message}</p>
                </div>
              </form>
            </div>

            <section id="scan-history" className="scan-history" data-testid="scan-history" aria-labelledby="scan-history-title">
              <div className="scan-history__heading">
                <div>
                  <p className="eyebrow">Private session ledger</p>
                  <h3 id="scan-history-title">Saved scans</h3>
                </div>
                <span>{history.filter((saved) => saved.chainId === network.chainId).length.toString().padStart(2, "0")} runs</span>
              </div>

              {historyState === "loading" && <p className="scan-history__empty">Loading saved evidence…</p>}
              {historyState === "error" && <p className="scan-history__empty">History is temporarily unavailable. New scans can still be retried.</p>}
              {historyState === "ready" && history.length === 0 && (
                <p className="scan-history__empty">No scans saved in this browser yet. Other visitors cannot see your history.</p>
              )}
              {history.length > 0 && (
                <div className="scan-history__list">
                  {history.filter((saved) => saved.chainId === network.chainId).map((saved, index) => (
                    <button
                      type="button"
                      className="scan-history__row"
                      data-contract-address={saved.contractAddress}
                      key={saved.simulationId}
                      onClick={() => openSavedSimulation(saved)}
                      aria-label={`Open saved scan for ${saved.contractAddress}`}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{saved.analysis.label}</strong>
                      <code>{shorten(saved.contractAddress, 8)}</code>
                      <em className={`history-status history-status--${saved.status}`}>{saved.status}</em>
                      <time dateTime={saved.createdAt}>{saved.createdAt.slice(0, 10)}</time>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {(events.length > 0 || simulation) && (
              <div className="console" data-testid="simulation-console">
                <div className="console__header">
                  <span>Crash Lab / live analysis stream</span>
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
                  <div><dt>Contract type</dt><dd>{simulation.analysis.label}</dd></div>
                  <div><dt>Runtime size</dt><dd>{simulation.analysis.runtimeBytes.toLocaleString()} bytes</dd></div>
                  <div><dt>Capabilities</dt><dd>{simulation.analysis.capabilities.join(" · ") || "Custom interface"}</dd></div>
                  <div><dt>Selector surface</dt><dd>{simulation.analysis.selectorCandidates.length.toLocaleString()} PUSH4 candidates · read-only fingerprint</dd></div>
                  <div><dt>Runtime code hash</dt><dd>{shorten(simulation.codeHash, 12)}</dd></div>
                </dl>
                {simulation.analysis.implementationAddress && (
                  <p className="finding__implementation">
                    Proxy implementation: {simulation.analysis.implementationAddress}
                  </p>
                )}
                <div className="analysis-checks" aria-label="Live analysis checks">
                  {simulation.analysis.checks.map((check) => (
                    <div className={`analysis-check analysis-check--${check.outcome}`} key={check.id}>
                      <span>{check.outcome}</span>
                      <strong>{check.label}</strong>
                      <p>{check.detail}</p>
                    </div>
                  ))}
                </div>
                <p className="finding__disclaimer">
                  This surface report is read-only. A fork replay, when available below, is a separate executed test—not a full audit or proof of safety.
                </p>
              </article>
            )}

            {simulation && state === "complete" && simulation.analysis.kind === "erc4626-vault" && isDemoReplayTarget(simulation.chainId, simulation.contractAddress) && (
              <section className="fork-replay" data-testid="fork-replay" aria-labelledby="fork-replay-title">
                <div className="fork-replay__intro">
                  <div>
                    <p className="eyebrow">Controlled demo replay</p>
                    <h3 id="fork-replay-title">Test the vault, not the live chain.</h3>
                  </div>
                  <span>ERC-4626 · DONATION INFLATION</span>
                </div>
                <p>
                  Crash Lab forks a pinned {network.name} block, funds two test accounts on that fork,
                  makes a first deposit and direct donation, then checks whether a non-zero victim deposit mints zero shares.
                  This template needs an empty vault and an asset with a usable public mint function on the fork.
                  Replay is available only for Crash Lab&apos;s fixed demo vaults. Other contracts receive read-only analysis.
                </p>
                {!forkReplay && (
                  <button className="button button--primary" type="button" onClick={runForkReplay}
                    disabled={forkState === "running"} data-testid="run-fork-replay">
                    {forkState === "running" ? "Replaying on fork…" : "Run isolated vault replay"}
                  </button>
                )}
                <p className={`fork-replay__status fork-replay__status--${forkState}`} role="status" aria-live="polite">{forkMessage}</p>
                {forkReplay && (
                  <div className="fork-replay__result" data-testid="fork-replay-result">
                    <strong className={`fork-replay__outcome fork-replay__outcome--${forkReplay.outcome}`}>
                      {forkReplay.outcome === "reproduced" ? "Zero-share deposit reproduced" : forkReplay.outcome.replaceAll("-", " ")}
                    </strong>
                    <p>{forkReplay.reason}</p>
                    <dl>
                      <div><dt>Pinned block</dt><dd>{forkReplay.blockNumber.toLocaleString()}</dd></div>
                      <div><dt>Block hash</dt><dd>{forkReplay.blockHash}</dd></div>
                      <div><dt>Starting state</dt><dd>{forkReplay.stateFixture === "reference-empty-reset" ? "Reference fixture: supply and vault asset balance reset on fork" : "Live snapshot (unchanged)"}</dd></div>
                      <div><dt>Victim deposit</dt><dd>{forkReplay.victimDepositAssets ?? "not reached"} asset units</dd></div>
                      <div><dt>Victim shares</dt><dd>{forkReplay.victimShares ?? "not measured"}</dd></div>
                      <div><dt>Evidence hash</dt><dd>{forkReplay.evidenceHash}</dd></div>
                    </dl>
                    {forkReplay.transactions.length > 0 && (
                      <div className="fork-replay__transactions">
                        <h4>Fork-only transactions</h4>
                        {forkReplay.transactions.map((transaction) => (
                          <div key={transaction.hash}><span>{transaction.label}</span><code>{shorten(transaction.hash, 10)}</code></div>
                        ))}
                      </div>
                    )}
                    <small>Fork transaction hashes are local evidence, not mainnet explorer links. An inconclusive or non-reproduced result is not a safety certification.</small>
                  </div>
                )}
              </section>
            )}

            {simulation && state === "complete" && (
              <section className="ai-investigation" data-testid="ai-investigation" aria-labelledby="ai-investigation-title">
                <div className="ai-investigation__intro">
                  <div>
                    <p className="eyebrow">AI-native investigation</p>
                    <h3 id="ai-investigation-title">Let the agent choose the next probes.</h3>
                  </div>
                  <span className="ai-model">DEEPSEEK V4 FLASH</span>
                </div>
                <p className="ai-investigation__lede">
                  The agent can only use Crash Lab&apos;s read-only {network.name} tools. Deterministic evidence remains the source of truth; unsupported AI claims are discarded.
                </p>
                {!aiInvestigation && (
                  <button
                    className="button button--primary"
                    type="button"
                    onClick={runAiInvestigation}
                    disabled={aiState === "running"}
                    data-testid="run-ai-investigation"
                  >
                    {aiState === "running" ? "Investigating…" : "Run AI investigation"}
                  </button>
                )}
                <p className={`ai-status ai-status--${aiState}`} role="status" aria-live="polite">{aiMessage}</p>

                {aiInvestigation && (
                  <div className="ai-report" data-testid="ai-report">
                    <div className="ai-report__summary">
                      <div><span>Review level</span><strong>{aiInvestigation.reviewLevel}</strong></div>
                      <div><span>Confidence</span><strong>{Math.round(aiInvestigation.confidence * 100)}%</strong></div>
                      <div><span>Read-only tools</span><strong>{aiInvestigation.toolsUsed.length}</strong></div>
                      <div><span>Report source</span><strong>{aiInvestigation.reportSource === "deepseek" ? "DeepSeek" : "Evidence fallback"}</strong></div>
                    </div>
                    <p className="ai-report__overview">{aiInvestigation.overview}</p>

                    <div className="ai-tool-strip" aria-label="Tools selected by the agent">
                      {aiInvestigation.toolsUsed.map((toolName) => <code key={toolName}>{toolName}</code>)}
                    </div>

                    <div className="ai-findings">
                      {aiInvestigation.findings.map((finding, index) => (
                        <article key={`${finding.title}-${index}`}>
                          <div><span>{String(index + 1).padStart(2, "0")}</span><em>{finding.classification}</em></div>
                          <h4>{finding.title}</h4>
                          <p>{finding.observation}</p>
                          <dl>
                            <div><dt>Why it matters</dt><dd>{finding.whyItMatters}</dd></div>
                            <div><dt>Next review step</dt><dd>{finding.nextStep}</dd></div>
                          </dl>
                          <footer>{finding.evidenceIds.map((id) => <code key={id}>{id}</code>)}</footer>
                        </article>
                      ))}
                    </div>

                    <div className="ai-evidence">
                      <h4>Evidence used</h4>
                      {aiInvestigation.evidence.map((item) => (
                        <div key={item.id}>
                          <code>{item.id}</code><strong>{item.title}</strong><p>{item.observation}</p>
                        </div>
                      ))}
                    </div>
                    <div className="ai-limitations">
                      <strong>Investigation limits</strong>
                      <ul>{aiInvestigation.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                    <div className="ai-attestation" data-testid="ai-attestation">
                      <div>
                        <span>Wallet → {network.name}</span>
                        <h4>Anchor this AI report</h4>
                        <p>
                          Commit this exact evidence envelope with a zero-value transaction from your wallet.
                          Only its hash is placed in transaction data; the target contract is never called.
                        </p>
                      </div>
                      <button
                        className="button button--primary"
                        type="button"
                        onClick={anchorAiReport}
                        disabled={walletState === "signing" || walletState === "confirming" || walletState === "confirmed"}
                        data-testid="anchor-ai-report"
                      >
                        {walletState === "signing" ? "Open wallet…" : walletState === "confirming" ? "Confirming…" : walletState === "confirmed" ? "Report anchored" : walletAddress ? "Anchor report on-chain" : "Connect + anchor report"}
                      </button>
                      <p className={`wallet-status wallet-status--${walletState}`} role="status" aria-live="polite">{walletMessage}</p>
                      {attestationHash && (
                        <dl>
                          <div><dt>AI report hash</dt><dd>{attestationReportHash}</dd></div>
                          <div><dt>Wallet</dt><dd>{walletAddress}</dd></div>
                          <div><dt>Transaction</dt><dd>{attestationHash}</dd></div>
                        </dl>
                      )}
                      {attestationHash && (
                        <a className="text-link" href={`${network.explorerUrl}/tx/${attestationHash}`} target="_blank" rel="noreferrer">Inspect wallet attestation ↗</a>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            <article id="passport" className="passport-proof">
              <div className="passport-proof__intro">
                <p className="eyebrow">{network.name} Simulation Passport</p>
                <h2>Controlled proof. On-chain.</h2>
                <p>
                  The Passport anchors the controlled donation-inflation specimen and its patched replay. It proves the evidence existed; it is not a blanket safety badge for arbitrary contracts.
                </p>
              </div>
              <dl>
                <div><dt>Status</dt><dd><i className={canonicalRunReady && canonicalMatchesNetwork ? "proof-light proof-light--ok" : "proof-light"} />{canonicalRunReady && canonicalMatchesNetwork ? "Replay anchored on Mainnet" : "Contract deployed; no replay published"}</dd></div>
                {canonicalMatchesNetwork ? <>
                  <div><dt>Passport contract</dt><dd>{canonicalRun.passport.contractAddress}</dd></div>
                  <div><dt>Simulation ID</dt><dd>{canonicalRun.passport.simulationId}</dd></div>
                  <div><dt>Report hash</dt><dd>{canonicalRun.passport.reportHash}</dd></div>
                  <div><dt>Before / after</dt><dd>{canonicalRun.attack.victimShares} → {canonicalRun.replay.victimShares} victim shares</dd></div>
                </> : <div><dt>Passport contract</dt><dd>{contracts.passport}</dd></div>}
              </dl>
              <div className="passport-proof__actions">
                <a className="button button--dark" href={`${network.explorerUrl}/address/${contracts.passport}`} target="_blank" rel="noreferrer">Inspect Passport ↗</a>
                {canonicalMatchesNetwork && canonicalRun.passport.transactionHash && <a className="text-link" href={`${network.explorerUrl}/tx/${canonicalRun.passport.transactionHash}`} target="_blank" rel="noreferrer">Open proof transaction ↗</a>}
              </div>
            </article>
          </div>
        </section>
      </main>

      <nav className="mobile-workspace-nav" aria-label="Workspace shortcuts">
        <a href="#start-simulation">Analyze</a>
        <a href="#scan-history">History</a>
        <a href="#demo-lab">Demo Lab</a>
        <a href="#passport">Passport</a>
      </nav>

      <footer className="site-footer">
        <div className="section-shell site-footer__grid">
          <div className="footer-brand">
            <div className="footer-brand__lockup"><Image src="/images/crash-lab-mark.png" alt="" width={54} height={54} /><strong>CRASH LAB</strong></div>
            <span>Experimental protocol hardening</span>
            <p>Live smart-contract evidence and isolated vault replays for {network.name}.</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <div><strong>Analyze</strong><a href="#start-simulation">Contract analyzer</a><a href="#simulator">How it works</a><a href="#how-it-works">Analysis checks</a></div>
            <div><strong>Resources</strong><a href="/api/health">API health</a><a href="/demo/crash-lab-demo.mp4" target="_blank" rel="noreferrer">Demo video ↗</a><a href="https://github.com/Nifemi0/bot-chain-crash-lab" target="_blank" rel="noreferrer">GitHub source ↗</a></div>
            <div><strong>{network.name}</strong><a href={network.explorerUrl} target="_blank" rel="noreferrer">Block explorer ↗</a><a href={`${network.explorerUrl}/address/${contracts.passport}`} target="_blank" rel="noreferrer">Passport contract ↗</a></div>
          </nav>
        </div>
        <div className="section-shell footer-bottom">
          <span>© 2026 CRASH LAB V1</span>
          <div className="footer-meta" aria-label="Network information">
            <span>{network.name} · {network.chainId}</span>
            <span>Read-only scan + vault fork</span>
            <span>Optional wallet attestation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
