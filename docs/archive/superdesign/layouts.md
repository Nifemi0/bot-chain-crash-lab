# Shared Layout

## BOT Chain Crash Lab single-page shell

- Source: `work/test-footage-redesign.html`
- Description: Complete responsive page including navigation, hero, capability rail, failure ledger, contract dossier, footer, and interaction scripts.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://api.fontshare.com/v2/css?f[]=barlow-condensed@600,700&f[]=inter-tight@400,600&f[]=ibm-plex-mono@400,600&display=swap" rel="stylesheet">
  <style>
    @view-transition { navigation: auto; }
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: 0.4s;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .font-display { font-family: 'Barlow Condensed', sans-serif; }
    .font-body { font-family: 'Inter Tight', sans-serif; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }

    body {
      margin: 0;
      padding: 0;
      background-color: #F2EEE6;
      color: #12110F;
      overflow-x: hidden;
    }

    html {
      scroll-behavior: smooth;
      scroll-padding-top: 72px;
    }

    .site-nav {
      background-color: rgba(242, 238, 230, 0);
      box-shadow: 0 0 0 rgba(18, 17, 15, 0);
      transition: background-color 280ms ease, box-shadow 280ms ease;
      will-change: background-color, box-shadow;
    }

    .nav-inner,
    .nav-wordmark,
    .nav-cta {
      transition-duration: 320ms;
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }

    .nav-inner {
      height: 80px;
      transition-property: height;
    }

    .nav-wordmark {
      transition-property: font-size, letter-spacing;
    }

    .nav-cta {
      height: 44px;
      transition-property: height, padding, background-color;
    }

    .mobile-nav-toggle {
      width: 44px;
      height: 44px;
    }

    .site-nav.is-scrolled {
      background-color: #F2EEE6;
      box-shadow: 0 10px 30px rgba(18, 17, 15, 0.07);
    }

    .site-nav.is-scrolled .nav-inner {
      height: 60px;
    }

    .site-nav.is-scrolled .nav-wordmark {
      font-size: 22px;
      letter-spacing: -0.025em;
    }

    .site-nav.is-scrolled .nav-cta {
      height: 40px;
    }

    @media (min-width: 640px) {
      .nav-cta { height: 48px; }
      .site-nav.is-scrolled .nav-cta { height: 42px; }
    }

    @media (max-width: 639px) {
      .nav-inner { height: 68px; }
      .site-nav.is-scrolled .nav-inner { height: 60px; }
      .site-nav .nav-wordmark { font-size: clamp(17px, 4.8vw, 19px); }
      .site-nav.is-scrolled .nav-wordmark { font-size: clamp(17px, 4.6vw, 18px); }
      .site-nav .nav-cta,
      .site-nav.is-scrolled .nav-cta { height: 44px; padding-inline: 14px; }
      .site-nav.is-scrolled .mobile-nav-panel { top: 68px; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .site-nav,
      .nav-inner,
      .nav-wordmark,
      .nav-cta {
        transition: none !important;
      }
    }

    .paper-texture {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.03;
    }

    .impact-rig-mask {
      isolation: isolate;
    }

    .hero-art-shell::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(
        90deg,
        rgba(242, 238, 230, 0.96) 0%,
        rgba(242, 238, 230, 0.88) 42%,
        rgba(242, 238, 230, 0.42) 72%,
        rgba(242, 238, 230, 0.10) 100%
      );
    }

    @media (min-width: 640px) {
      .hero-art-shell::after { display: none; }
    }

    .impact-rig-art {
      mix-blend-mode: multiply;
      filter: contrast(1.04) saturate(0.92);
      -webkit-mask-image: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 0, 0, 0.10) 12%,
        rgba(0, 0, 0, 0.48) 28%,
        #000 48%,
        #000 100%
      );
      mask-image: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 0, 0, 0.10) 12%,
        rgba(0, 0, 0, 0.48) 28%,
        #000 48%,
        #000 100%
      );
    }
  </style>
  <meta name="view-transition" content="same-origin">
</head>
<body>
  <div class="min-h-screen bg-[#F2EEE6] font-body relative flex flex-col">
    <div class="fixed inset-0 pointer-events-none paper-texture z-50"></div>

    <!-- Compact navigation layered into the hero -->
    <nav data-site-nav aria-label="Primary" class="site-nav fixed inset-x-0 top-0 z-40">
      <div class="nav-inner max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-3 sm:gap-6">
        <div class="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <span class="w-4 sm:w-6 h-1 bg-[#F2C230] shrink-0"></span>
          <span class="nav-wordmark font-display font-bold text-[22px] sm:text-[26px] tracking-[-0.04em] uppercase">BOT / CRASH LAB</span>
        </div>

        <div class="hidden lg:flex items-center gap-9 font-mono text-[10px] tracking-[0.12em] text-[#6A645B] uppercase">
          <a id="nav-how-it-works" href="#how-it-works" class="hover:text-[#12110F] transition-colors">How it works</a>
          <a id="nav-simulator" href="#simulator" class="hover:text-[#12110F] transition-colors">Simulator</a>
          <a id="nav-passport" href="#passport" class="hover:text-[#12110F] transition-colors">Passport</a>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button data-mobile-menu-toggle aria-controls="mobile-nav-panel" aria-expanded="false" aria-label="Open navigation" class="mobile-nav-toggle lg:hidden rounded-full bg-[#12110F] text-[#F2C230] flex items-center justify-center shrink-0">
            <span class="flex flex-col gap-1.5" aria-hidden="true">
              <span class="block w-4 h-[2px] bg-current"></span>
              <span class="block w-4 h-[2px] bg-current"></span>
            </span>
          </button>
          <a id="nav-cta-start" href="#start-simulation" class="nav-cta bg-[#F2C230] hover:bg-[#FFD64D] text-[#12110F] border border-[#12110F] font-semibold text-[12px] sm:text-[14px] px-5 sm:px-7 hidden sm:flex items-center rounded-full uppercase shrink-0">
            <span class="hidden sm:inline">Start a simulation</span>
            <span class="sm:hidden">Start</span>
          </a>
        </div>
      </div>

      <div id="mobile-nav-panel" data-mobile-menu class="mobile-nav-panel hidden lg:hidden absolute inset-x-4 sm:left-auto sm:right-8 sm:w-72 top-[76px] bg-[#F2EEE6] shadow-[0_18px_45px_rgba(18,17,15,0.16)] p-2 flex-col font-mono text-[11px] tracking-[0.12em] uppercase">
        <a id="mobile-nav-how-it-works" href="#how-it-works" class="h-12 px-4 flex items-center hover:bg-[#E5DFD3] transition-colors">How it works</a>
        <a id="mobile-nav-simulator" href="#simulator" class="h-12 px-4 flex items-center hover:bg-[#E5DFD3] transition-colors">Simulator</a>
        <a id="mobile-nav-passport" href="#passport" class="h-12 px-4 flex items-center hover:bg-[#E5DFD3] transition-colors">Passport</a>
        <a id="mobile-nav-start" href="#start-simulation" class="h-12 mt-2 px-4 flex items-center justify-center rounded-full bg-[#F2C230] text-[#12110F] font-semibold hover:bg-[#FFD64D] transition-colors">Start a simulation</a>
      </div>
    </nav>

    <main class="flex-1">
      <!-- Hero Section -->
      <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-24 lg:pb-32 grid grid-cols-12 relative overflow-hidden">
        <div class="col-span-12 lg:col-span-7 z-10 min-w-0">
          <div class="font-mono text-[11px] lg:text-[12px] tracking-[0.08em] sm:tracking-[0.1em] text-[#6A645B] mb-6 sm:mb-8 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2">
            <span>BOT CHAIN • CHAIN 677</span>
            <span class="inline-flex items-center gap-3">
              <span class="w-1.5 h-1.5 bg-[#F2C230]"></span>
              <span>DEMO ENVIRONMENT</span>
            </span>
          </div>
          
          <h1 class="font-display font-bold text-[12.2vw] sm:text-[76px] md:text-[88px] lg:text-[76px] xl:text-[104px] leading-[0.88] tracking-[-0.025em] uppercase mb-8 sm:mb-10 lg:mb-12">
            <span class="block whitespace-nowrap">Break your</span>
            <span class="block sm:hidden whitespace-nowrap">Protocol</span>
            <span class="block sm:hidden whitespace-nowrap">Before</span>
            <span class="hidden sm:block whitespace-nowrap">Protocol before</span>
            <span class="block whitespace-nowrap">Mainnet does.</span>
          </h1>

          <p class="max-w-xl text-[16px] sm:text-[18px] lg:text-[19px] leading-[1.55] text-[#6A645B] mb-8 sm:mb-10 lg:mb-12">
            Deploy to a controlled adversarial sandbox. Our autonomous agent-wallets physically stress your protocol accounting until the invariant fractures. Same-attack replay verifies your patch.
          </p>

          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-6">
            <a id="hero-spawn" href="#start-simulation" class="w-fit max-w-full sm:w-auto self-start h-12 sm:h-14 bg-[#F2C230] hover:bg-[#FFD64D] text-[#12110F] font-semibold text-[13px] sm:text-[15px] px-7 sm:px-8 lg:px-9 flex items-center justify-center transition-all rounded-full uppercase border border-[#12110F]">
              Spawn Simulation
            </a>
            <a id="hero-watch" href="#simulator" class="w-fit max-w-full sm:w-auto self-start h-12 sm:h-14 bg-[#12110F] border border-[#12110F] text-[#F2EEE6] font-semibold text-[13px] sm:text-[15px] px-7 sm:px-8 lg:px-9 flex items-center justify-center hover:bg-[#292621] transition-all rounded-full uppercase text-center">
              Watch a protocol break
            </a>
          </div>
        </div>

        <!-- The Impact Rig Viewport -->
        <div class="hero-art-shell absolute right-0 top-0 bottom-0 w-full lg:w-[66%] block">
          <div class="impact-rig-mask w-full h-full relative overflow-hidden">
            <!-- Placeholder for Hero Artwork -->
            <img src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/projects/9ac13d4b-6e2d-43db-ae5d-808eff331873/external-assets/becd4769-0a15-42a8-a8ed-7b71d5f57774-hero-protocol-impact-rig.png" alt="Physical protocol impact rig striking a smart-contract vault specimen with six transaction actuators" class="impact-rig-art w-full h-full object-cover object-center opacity-[0.34] lg:opacity-100">
            
            <!-- Live Specimen Overlay -->
            <div class="absolute top-12 right-12 text-right hidden lg:block">
              <div class="font-mono text-[11px] uppercase tracking-widest bg-[#12110F] text-[#F2EEE6] px-3 py-1 mb-2 inline-block">Specimen: V-042</div>
              <div class="font-mono text-[13px] text-[#12110F] uppercase">Treasury: 100,000 BOT</div>
            </div>

            <!-- Yellow Calibrated Tape -->
            <div class="absolute bottom-24 -left-12 right-0 h-10 bg-[#F2C230] rotate-[-5deg] hidden lg:flex items-center overflow-hidden">
              <div class="whitespace-nowrap font-mono text-[12px] font-bold tracking-[0.3em] text-[#12110F] flex gap-12 animate-marquee">
                <span>AGENT_23 DISPATCHED</span>
                <span>TRANSACTION_486 EXECUTING</span>
                <span>INVARIANT_01 MONITORING</span>
                <span>AGENT_23 DISPATCHED</span>
                <span>TRANSACTION_486 EXECUTING</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Full-bleed Yellow Rail -->
      <div id="how-it-works" class="bg-[#F2C230] py-5 sm:py-6">
        <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5 lg:gap-8 font-mono text-[10px] lg:text-[11px] font-bold tracking-[0.1em] sm:tracking-[0.16em] lg:tracking-[0.2em] text-[#12110F] uppercase leading-tight">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="w-2 h-2 bg-[#12110F]"></span>
            Real Transactions
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="w-2 h-2 bg-[#12110F]"></span>
            Autonomous Agents
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="w-2 h-2 bg-[#12110F]"></span>
            Invariant Monitoring
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="w-2 h-2 bg-[#12110F]"></span>
            Same-Attack Replay
          </div>
        </div>
      </div>

      <!-- Failure Ledger Section -->
      <section id="simulator" class="bg-[#12110F] text-[#F2EEE6] py-20 sm:py-24 lg:py-32 overflow-hidden">
        <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div class="grid grid-cols-12 gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
            <div class="col-span-12 lg:col-span-6">
              <h2 class="font-display font-bold text-[10vw] sm:text-[56px] lg:text-[64px] leading-[0.92] uppercase">
                <span class="block whitespace-nowrap">Inside the Test:</span>
                <span class="block whitespace-nowrap text-[#F2C230]">Demo Run #0042</span>
              </h2>
            </div>
            <div class="col-span-12 lg:col-span-6 flex items-end justify-start lg:justify-end">
               <div class="bg-[#D9362B] text-white px-5 sm:px-7 lg:px-8 py-3 sm:py-4 font-display font-bold text-[20px] sm:text-[26px] lg:text-3xl uppercase tracking-tighter whitespace-nowrap">
                 Protocol Compromised
               </div>
            </div>
          </div>

          <!-- Continuous Failure Ledger -->
          <div class="space-y-5">
            <!-- Row 1 -->
            <div class="py-7 sm:py-8 grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-4 items-start lg:items-center">
              <div class="col-span-10 sm:col-span-3 lg:col-span-2 font-mono text-[11px] text-[#AAA297] tracking-widest uppercase">01 / ATTACK</div>
              <div class="col-span-12 sm:col-span-9 lg:col-span-4 min-w-0">
                <h3 class="font-display text-[22px] sm:text-[24px] leading-tight font-bold uppercase mb-2">Signal-Yellow Ingress</h3>
                <p class="text-[15px] lg:text-[14px] leading-relaxed text-[#AAA297]">Agent 23 (Adversarial Strategist) dispatches a multi-hop flash loan sequence targeting share accounting.</p>
              </div>
              <div class="col-span-11 sm:col-span-10 lg:col-span-4 font-mono text-[12px] sm:text-[13px] leading-relaxed text-[#F2C230] break-words">
                <span class="block sm:inline">TXN_ID: 0x5a1...9e0</span>
                <span class="block sm:inline">• 10 BOT → 82,410 BOT</span>
              </div>
              <div class="col-span-1 sm:col-span-2 lg:col-span-2 text-right">
                <span class="inline-block w-4 h-4 bg-[#F2C230]"></span>
              </div>
            </div>
            <!-- Row 2 -->
            <div class="py-7 sm:py-8 grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-4 items-start lg:items-center">
              <div class="col-span-10 sm:col-span-3 lg:col-span-2 font-mono text-[11px] text-[#AAA297] tracking-widest uppercase">02 / IMPACT</div>
              <div class="col-span-12 sm:col-span-9 lg:col-span-4 min-w-0">
                <h3 class="font-display text-[22px] sm:text-[24px] leading-tight font-bold uppercase mb-2">Invariant Fracture</h3>
                <p class="text-[15px] lg:text-[14px] leading-relaxed text-[#AAA297]">Protocol vault stresses under extreme capital withdrawal. The system monitors live accounting vs reserves.</p>
              </div>
              <div class="col-span-11 sm:col-span-10 lg:col-span-4 font-mono text-[12px] sm:text-[13px] leading-relaxed text-[#D9362B] break-words">INV-01 FAIL: totalAssets &lt; totalShares</div>
              <div class="col-span-1 sm:col-span-2 lg:col-span-2 text-right">
                <span class="inline-block w-4 h-4 bg-[#D9362B]"></span>
              </div>
            </div>
            <!-- Row 3 -->
            <div class="py-7 sm:py-8 grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-4 items-start lg:items-center">
              <div class="col-span-10 sm:col-span-3 lg:col-span-2 font-mono text-[11px] text-[#AAA297] tracking-widest uppercase">03 / REPLAY</div>
              <div class="col-span-12 sm:col-span-9 lg:col-span-4 min-w-0">
                <h3 class="font-display text-[22px] sm:text-[24px] leading-tight font-bold uppercase mb-2">Verification Loop</h3>
                <p class="text-[15px] lg:text-[14px] leading-relaxed text-[#AAA297]">AI proposes virtual-share offset patch. Replaying exact sequence in Patched Universe.</p>
              </div>
              <div class="col-span-11 sm:col-span-10 lg:col-span-4 font-mono text-[12px] sm:text-[13px] leading-relaxed text-[#8FB56F] break-words">REPLAY SUCCESS: Exploit Rejected</div>
              <div class="col-span-1 sm:col-span-2 lg:col-span-2 text-right">
                <span class="inline-block w-4 h-4 bg-[#8FB56F]"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Start Call to Action (Physical Dossier Style) -->
      <section id="start-simulation" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-24 lg:py-32 flex justify-center">
        <div id="passport" class="w-full max-w-4xl bg-[#E5DFD3] p-6 pt-16 sm:p-10 sm:pt-16 lg:p-16 rounded-none relative">
          <div class="absolute top-0 right-5 sm:right-10 lg:right-12 w-24 h-8 bg-[#12110F] text-[#F2EEE6] font-mono text-[9px] flex items-center justify-center uppercase tracking-widest">Calibration OK</div>
          <div class="mb-8 sm:mb-10 lg:mb-12">
            <h2 class="font-display font-bold text-[40px] sm:text-[48px] leading-[0.95] uppercase mb-5 sm:mb-6">Ready for the Impact?</h2>
            <p class="text-[#6A645B] text-[16px] sm:text-lg leading-relaxed max-w-2xl">Submit your contract address. Our autonomous agents will begin the stress sequence immediately. Demo results are visibly labeled.</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="w-full min-w-0 flex-1">
              <label for="contract-address" class="block mb-2 font-mono text-[11px] sm:text-[12px] font-semibold tracking-[0.1em] uppercase text-[#6A645B]">Contract address</label>
              <input id="contract-address" type="text" placeholder="ENTER BOT CHAIN ADDRESS (0x...)" class="w-full min-w-0 h-[60px] sm:h-16 bg-[#F7F3EA] border-[1.5px] border-[#6A645B] rounded-none px-4 sm:px-6 font-mono text-[13px] sm:text-[14px] focus:outline-none focus:border-[#F2C230] transition-colors">
            </div>
            <button id="submit-contract" class="w-full sm:w-auto h-[60px] sm:h-16 sm:self-end bg-[#F2C230] text-[#12110F] border border-[#12110F] rounded-full px-6 sm:px-10 font-display font-bold text-[15px] sm:text-base uppercase tracking-[0.08em] sm:tracking-widest whitespace-nowrap hover:bg-[#FFD64D] transition-colors">Begin Simulation</button>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="py-12 sm:py-20 bg-[#F2EEE6]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-12 gap-8 sm:gap-12">
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div class="flex flex-col leading-none">
            <span class="font-display font-bold text-2xl tracking-tighter uppercase">BOT / CRASH LAB</span>
            <span class="font-mono text-[11px] tracking-[0.08em] sm:tracking-[0.1em] text-[#6A645B]">EXPERIMENTAL PROTOCOL HARDENING</span>
          </div>
          <p class="text-[14px] text-[#6A645B] max-w-xs">
            A disciplined environment for adversarial contract stress-testing on BOT Chain (Chain ID 677).
          </p>
        </div>
        <div class="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 sm:gap-8 font-mono text-[11px] tracking-[0.08em] sm:tracking-widest uppercase text-[#6A645B] leading-relaxed">
          <div class="flex flex-col gap-4">
            <span class="text-[#12110F] font-bold">Testing</span>
            <a id="footer-simulator" href="#" class="hover:text-[#12110F] transition-colors">Simulator</a>
            <a id="footer-vault" href="#" class="hover:text-[#12110F] transition-colors">Replay Vault</a>
            <a id="footer-agents" href="#" class="hover:text-[#12110F] transition-colors">Agent Matrix</a>
          </div>
          <div class="flex flex-col gap-4">
            <span class="text-[#12110F] font-bold">Resources</span>
            <a id="footer-docs" href="#" class="hover:text-[#12110F] transition-colors">Documentation</a>
            <a id="footer-api" href="#" class="hover:text-[#12110F] transition-colors">API Access</a>
            <a id="footer-foundry" href="#" class="hover:text-[#12110F] transition-colors">Foundry Repro</a>
          </div>
          <div class="flex flex-col gap-4">
            <span class="text-[#12110F] font-bold">Network</span>
            <span class="text-[#12110F]">BOT CHAIN 677</span>
            <a id="footer-explorer" href="#" class="hover:text-[#12110F] transition-colors">Explorer</a>
            <a id="footer-rpc" href="#" class="hover:text-[#12110F] transition-colors">RPC Info</a>
          </div>
          <div class="flex flex-col gap-4">
            <span class="text-[#12110F] font-bold">Connect</span>
            <a id="footer-x" href="#" class="hover:text-[#12110F] transition-colors">X / Twitter</a>
            <a id="footer-github" href="#" class="hover:text-[#12110F] transition-colors">GitHub</a>
          </div>
        </div>
      </div>
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 mt-10 sm:mt-20 pt-4 sm:pt-8 flex items-center font-mono text-[10px] tracking-[0.1em] sm:tracking-[0.2em] text-[#6A645B] uppercase">
        <span>© 2024 CRASH LAB V.1 — BOT CHAIN NATIVE</span>
      </div>
    </footer>
  </div>

  <style>
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      animation: marquee 20s linear infinite;
    }
  </style>
  <script>
    (() => {
      const nav = document.querySelector('[data-site-nav]');
      if (!nav) return;

      const menuToggle = nav.querySelector('[data-mobile-menu-toggle]');
      const mobileMenu = nav.querySelector('[data-mobile-menu]');

      const closeMobileMenu = () => {
        if (!menuToggle || !mobileMenu) return;
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
      };

      if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
          const willOpen = mobileMenu.classList.contains('hidden');
          mobileMenu.classList.toggle('hidden', !willOpen);
          mobileMenu.classList.toggle('flex', willOpen);
          menuToggle.setAttribute('aria-expanded', String(willOpen));
          menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', closeMobileMenu);
        });

        window.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') closeMobileMenu();
        });

        window.addEventListener('resize', () => {
          if (window.innerWidth >= 1024) closeMobileMenu();
        });
      }

      let ticking = false;
      const updateNav = () => {
        nav.classList.toggle('is-scrolled', window.scrollY > 36);
        ticking = false;
      };

      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateNav);
      };

      updateNav();
      window.addEventListener('scroll', onScroll, { passive: true });
    })();
  </script>
</body>
</html>


```

