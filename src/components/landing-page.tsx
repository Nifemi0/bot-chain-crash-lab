import Image from "next/image";
import Link from "next/link";

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link className="landing-brand" href="/" aria-label="Crash Lab home">
      <Image src="/images/crash-lab-mark.png" alt="" width={38} height={38} priority={!footer} />
      <span>CRASH LAB</span>
    </Link>
  );
}

function OpenApp({ location }: { location: "nav" | "hero" | "final" }) {
  return (
    <Link className={location === "nav" ? "landing-nav-cta" : "landing-pill"} href="/app">
      Open Crash Lab <span aria-hidden="true">↗</span>
    </Link>
  );
}

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-nav" aria-label="Site navigation">
        <Brand />
        <nav aria-label="Page sections">
          <a href="#what">What it does</a>
          <a href="#workflow">How it works</a>
          <a href="#trust">Trust boundaries</a>
        </nav>
        <OpenApp location="nav" />
      </header>

      <main id="top">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-wrap landing-hero-grid">
            <div className="landing-hero-copy">
              <p className="landing-eyebrow">Live contract evidence · BOT Chain + Robinhood Chain</p>
              <h1 id="landing-title">Know what<br />is <em>deployed.</em><br />Then decide.</h1>
              <p className="landing-hero-lede">
                A polished frontend can hide a lot. Crash Lab starts with the contract itself—live bytecode,
                interface signals, proxy details, and a report that shows where each observation came from.
              </p>
              <div className="landing-hero-actions">
                <OpenApp location="hero" />
                <a className="landing-text-link" href="#what">See what you get ↓</a>
              </div>
              <p className="landing-hero-note">No wallet needed to scan · Read-only by default</p>
            </div>

            <div className="landing-evidence-stage" aria-label="Illustration of Crash Lab report structure">
              <div className="landing-stage-top"><span>Crash Lab · Evidence view</span><span className="landing-stage-dots" aria-hidden="true"><i /><i /><i /></span></div>
              <div className="landing-stage-title"><strong>What the chain shows</strong><span>Read-only</span></div>
              <div className="landing-stage-line"><b>Runtime</b><span>Deployed code fingerprint</span></div>
              <div className="landing-stage-line"><b>Interfaces</b><span>Observed standard-family signals</span></div>
              <div className="landing-stage-line"><b>Proxy</b><span>Implementation slot, when present</span></div>
              <div className="landing-stage-line"><b>Review</b><span>Cited observations and open questions</span></div>
              <div className="landing-stage-signal">Evidence first. Interpretation second.</div>
              <p className="landing-stage-caption">Illustrative report layout. These labels are not findings about a particular contract.</p>
            </div>
          </div>
          <div className="landing-hero-wave" aria-hidden="true" />
        </section>

        <div className="landing-facts"><div className="landing-wrap landing-facts-grid">
          <div><i aria-hidden="true" />Live runtime, not marketing copy</div>
          <div><i aria-hidden="true" />BOT Chain and Robinhood Chain</div>
          <div><i aria-hidden="true" />Evidence linked to each observation</div>
        </div></div>

        <section id="what" className="landing-section landing-what" aria-labelledby="what-title">
          <div className="landing-wrap">
            <div className="landing-section-head">
              <p className="landing-eyebrow">Why Crash Lab exists</p>
              <h2 id="what-title">A better first look at a contract.</h2>
              <p>Paste a deployed address and get a structured place to begin your review. Crash Lab collects what can be read from the chain, then keeps uncertainty visible instead of turning it into a green safety badge.</p>
            </div>
            <div className="landing-why-grid">
              <div className="landing-quote-panel"><strong>The chain is the starting point. Not the promise on a landing page.</strong><p>Useful for builders checking a deployment, reviewers orienting themselves, and curious users who want evidence before interacting.</p></div>
              <div className="landing-evidence-list">
                <article><b>Live bytecode</b><span>Read the runtime currently deployed at the address and record its code hash.</span></article>
                <article><b>Interface signals</b><span>Probe supported standards and identify likely token, NFT, vault, or proxy surfaces without declaring them safe.</span></article>
                <article><b>Review questions</b><span>Show cautionary execution surfaces and family coverage as starting points for source-level review.</span></article>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="landing-section landing-workflow" aria-labelledby="workflow-title">
          <div className="landing-wrap">
            <div className="landing-section-head"><p className="landing-eyebrow">From address to understanding</p><h2 id="workflow-title">A short path to real evidence.</h2><p>No account setup and no wallet prompt to start scanning. The optional steps stay optional.</p></div>
            <div className="landing-workflow-grid">
              <article><span className="landing-step">1</span><h3>Choose a chain.</h3><p>Select BOT Chain Mainnet or Robinhood Chain Mainnet and enter a deployed contract address.</p></article>
              <article><span className="landing-step">2</span><h3>Read the report.</h3><p>Inspect bytecode, interface signals, proxy information, and explicit gaps in coverage.</p></article>
              <article><span className="landing-step">3</span><h3>Go deeper if needed.</h3><p>Ask AI to explain cited evidence. If you choose, connect a wallet later to anchor the exact report hash.</p></article>
            </div>
          </div>
        </section>

        <section id="passport" className="landing-section landing-proof" aria-labelledby="proof-title">
          <div className="landing-wrap">
            <div className="landing-section-head"><p className="landing-eyebrow">Beyond the first scan</p><h2 id="proof-title">Explanation and proof, kept separate.</h2><p>The report stays tied to observable evidence even when you use an AI explanation or publish an on-chain commitment.</p></div>
            <div className="landing-proof-grid">
              <article><h3>AI explains the evidence.</h3><p>DeepSeek can turn read-only observations into a cited review narrative. If the provider cannot complete a valid report, Crash Lab labels the result as an evidence-only fallback—never a clean bill of health.</p><div className="landing-micro">Optional · Read-only · Source-labeled</div></article>
              <article><h3>Passport anchors a hash.</h3><p>With a connected wallet, you can commit the exact report hash on-chain. That proves what was published, not that the target contract is safe or fully audited.</p><div className="landing-micro">Optional · Wallet-signed · Not a safety badge</div></article>
            </div>
          </div>
        </section>

        <section id="trust" className="landing-section landing-trust" aria-labelledby="trust-title">
          <div className="landing-wrap landing-trust-grid">
            <div><p className="landing-eyebrow">Clear limits build better trust</p><h2 id="trust-title">What the lab does not claim.</h2></div>
            <div className="landing-trust-list">
              <div><strong>Not an audit</strong>A scan is a starting point for review, not a certification of security.</div>
              <div><strong>Not every family is identifiable</strong>Unknown protocols may need a verified ABI and source code before they can be classified meaningfully.</div>
              <div><strong>Replay is a separate demo</strong>The isolated ERC-4626 vault replay works only for Crash Lab&apos;s fixed demo contracts; ordinary submitted contracts receive read-only analysis.</div>
              <div><strong>Unsupported claims stay out</strong>AI observations require cited evidence, and provider failures are shown as fallbacks.</div>
            </div>
          </div>
        </section>

        <section className="landing-last-call" aria-labelledby="last-title"><div className="landing-wrap"><h2 id="last-title">Start with what is actually on-chain.</h2><p>Bring an address. Crash Lab will show the evidence it can collect—and tell you plainly what remains unknown.</p><OpenApp location="final" /></div></section>
      </main>

      <footer className="landing-footer"><div className="landing-wrap"><div className="landing-footer-grid"><div className="landing-footer-brand"><Brand footer /><p>Live, read-only contract intelligence. A report is evidence of a review run, not proof of safety.</p></div><div className="landing-footer-links"><div><strong>Explore</strong><a href="#what">What it does</a><a href="#workflow">How it works</a><a href="#trust">Trust boundaries</a></div><div><strong>BOT Chain</strong><a href="https://botchain.ai" target="_blank" rel="noopener noreferrer">Official website ↗</a><a href="https://scan.botchain.ai" target="_blank" rel="noopener noreferrer">Explorer ↗</a></div></div></div><div className="landing-footer-bottom"><span>© 2026 Crash Lab</span><span>Read-only scan · Optional on-chain report anchor</span></div></div></footer>
    </div>
  );
}
