import React from "react";
import { ArrowRight, Layers, Compass, Sparkles } from "lucide-react";
import landingHero from "./landing-hero.jpg";

interface LandingScreenProps {
  onExplore: () => void;
  onRequestAccess: () => void;
}

export default function LandingScreen({ onExplore, onRequestAccess }: LandingScreenProps) {
  return (
    <div className="font-sans antialiased text-[#1a1c1b] bg-[#f9f9f7]">
      {/* Hero Section */}
      <section className="min-h-[75vh] flex flex-col justify-center py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-[1280px] mx-auto w-full">
          <div className="lg:col-span-7 z-10 space-y-6">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#444748] mb-2 block">
              The Art of Video Intelligence
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-light tracking-tight text-[#1a1c1b] leading-tight select-none">
              Transform Video <br />
              <span className="font-medium text-[#c47b5f]">into Intelligence</span>
            </h1>
            <p className="font-sans text-lg text-[#444748] max-w-xl leading-relaxed">
              Curator elevates raw competitor footage into a meticulously organized, fully searchable archive. We treat every frame as critical intelligence, designed for the modern brand strategist.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={onRequestAccess}
                className="bg-[#1a1c1b] text-[#f9f9f7] px-8 py-3.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#c47b5f] transition-colors shadow-museum"
              >
                Request Access
              </button>
              <button 
                onClick={onExplore}
                className="border border-[#747878]/30 px-8 py-3.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-widest text-[#1a1c1b] hover:bg-white hover:border-[#1a1c1b] transition-all"
              >
                Explore the Archive
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative h-[420px] w-full hidden lg:block">
            <div className="absolute inset-0 p-2 bg-white shadow-museum rounded-sm border border-[#e5e5e1]">
              <div className="w-full h-full bg-[#eeeeec] relative overflow-hidden flex items-center justify-center">
                <img 
                  src={landingHero} 
                  alt="Curator Architectural Aesthetics" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="w-full h-px bg-[#e5e5e1] my-8 opacity-30" />

      {/* Section: From Noise to Narrative */}
      <section className="py-16 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <h2 className="font-display text-4xl font-light text-[#1a1c1b] leading-tight select-none">
            From Noise to <span className="font-semibold italic">Narrative.</span>
          </h2>
          <p className="font-sans text-base text-[#444748] leading-relaxed">
            Thousands of hours of unorganized competitor footage obscure vital strategic insights. Curator acts as your digital archivist, employing advanced dual-layer understanding to parse the spoken word and the shown scene simultaneously. The result is a refined, searchable database where the exact moment you need is instantly accessible.
          </p>
        </div>
      </section>

      {/* Section: Bento Grid Features */}
      <section className="py-16 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Card 1: Natural Language Search */}
          <div className="md:col-span-8 p-8 bg-white border border-[#e5e5e1] rounded-lg shadow-museum flex flex-col justify-between h-72 group transition-all hover:border-[#1a1c1b]">
            <div>
              <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#444748] block mb-2">
                Precision Discovery
              </span>
              <h3 className="font-display text-2xl font-semibold text-[#1a1c1b]">
                Natural Language Search
              </h3>
            </div>
            
            <div className="w-full max-w-md bg-[#f9f9f7] border border-[#e5e5e1] p-4 flex items-center shadow-sm rounded-sm mx-auto my-4 transition-all group-hover:shadow-md">
              <Compass className="w-4 h-4 text-[#444748] mr-3 shrink-0" />
              <span className="font-sans text-xs italic text-[#747878] select-none">
                "Find moments where a minimalist watch is shown..."
              </span>
            </div>
          </div>

          {/* Card 2: Dual-Layer */}
          <div className="md:col-span-4 p-8 bg-white border border-[#e5e5e1] rounded-lg shadow-museum flex flex-col justify-between h-72 transition-all hover:border-[#c47b5f]">
            <div>
              <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#444748] block mb-2">
                Deep Analysis
              </span>
              <h3 className="font-display text-2xl font-semibold text-[#1a1c1b]">
                Dual-Layer Understanding
              </h3>
              <p className="font-sans text-xs text-[#444748] mt-3 leading-relaxed">
                Simultaneous processing of spoken narrative transcripts and physical visual framing timelines.
              </p>
            </div>
            <div className="flex justify-end text-[#e5e5e1]">
              <Layers className="w-12 h-12 stroke-1" />
            </div>
          </div>

          {/* Card 3: Multi-modal Ingestion */}
          <div className="md:col-span-12 p-8 bg-white border border-[#e5e5e1] rounded-lg shadow-museum flex flex-col md:flex-row gap-8 justify-between items-center transition-all hover:border-[#4a5d70]">
            <div className="md:w-1/3 space-y-4">
              <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#444748] block">
                Unified Media Support
              </span>
              <h3 className="font-display text-2xl font-semibold text-[#1a1c1b]">
                Multi-modal Ingestion
              </h3>
              <p className="font-sans text-xs text-[#444748] leading-relaxed">
                Ingest competitor video campaigns while simultaneously uploading companion print ads, key art, or storyboards. Curator critiques visual design languages side-by-side.
              </p>
            </div>
            <div className="md:w-2/3 w-full bg-[#f4f4f2] h-44 rounded-sm border border-[#e5e5e1] relative overflow-hidden flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4a5d70]/20 to-[#c47b5f]/10" />
              <div className="grid grid-cols-2 gap-4 w-full h-full relative z-10">
                {/* Video Ingest channel */}
                <div className="bg-white shadow-museum p-3 rounded-[2px] flex flex-col justify-between text-[10px] font-mono border border-[#e5e5e1]/60">
                  <div className="flex justify-between pb-1 border-b border-[#eeeeec] text-[9px] text-[#747878]">
                    <span>VIDEO CHANNEL</span>
                    <span>ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-6 h-6 rounded bg-[#f2e6e1]/70 flex items-center justify-center text-[#c47b5f] shrink-0 font-bold">▶</div>
                    <div className="truncate">
                      <p className="font-semibold text-[#1a1c1b] text-[9px]">campaign_reel.mp4</p>
                      <p className="text-[8px] text-[#747878]">06:45 • H.264</p>
                    </div>
                  </div>
                  <div className="h-1 bg-[#eeeeec] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c47b5f] w-3/4" />
                  </div>
                </div>

                {/* Print Ingest channel */}
                <div className="bg-white shadow-museum p-3 rounded-[2px] flex flex-col justify-between text-[10px] font-mono border border-[#e5e5e1]/60">
                  <div className="flex justify-between pb-1 border-b border-[#eeeeec] text-[9px] text-[#747878]">
                    <span>PRINT ATTACHMENT</span>
                    <span>ATTACHED</span>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-6 h-6 rounded bg-[#eeeeec] flex items-center justify-center text-[#4a5d70] shrink-0 font-bold">🖼</div>
                    <div className="truncate">
                      <p className="font-semibold text-[#1a1c1b] text-[9px]">print_ad_art.jpg</p>
                      <p className="text-[8px] text-[#747878]">2.4MB • PNG</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-[#c47b5f]">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Critique ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Curator Manifesto & Archive Collections Sector */}
      <section className="py-24 max-w-[1280px] mx-auto border-t border-[#e5e5e1]/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Manifesto Left block (Columns 7) */}
          <div className="lg:col-span-7 space-y-8 select-none">
            <div>
              <span className="font-sans text-[10px] font-bold text-[#c47b5f] tracking-widest uppercase block mb-3">
                THE ARCHIVE MANIFESTO
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[#1a1c1b] leading-tight">
                Meticulous curation is the ultimate <span className="font-medium text-[#c47b5f] italic">competitive leverage.</span>
              </h2>
            </div>
            
            <p className="font-sans text-sm text-[#444748] leading-relaxed max-w-xl">
              In an era of relentless digital noise and fleeting video content, true perception lies in the details. Curator rejects raw, unmanaged databases. We believe competitor campaigns should be treated as permanent artifacts of trade strategy—indexed with surgical precision, tracked for architectural patterns, and decrypted for hidden intent.
            </p>

            {/* Micro value-indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="border-l border-[#c47b5f] pl-4">
                <span className="font-mono text-xs font-bold text-[#1a1c1b] block">INGESTION</span>
                <span className="font-sans text-[10px] text-[#747878] mt-1 block">Anti-bot bypass proxies</span>
              </div>
              <div className="border-l border-[#1a1c1b] pl-4">
                <span className="font-mono text-xs font-bold text-[#1a1c1b] block">COGNITIVE</span>
                <span className="font-sans text-[10px] text-[#747878] mt-1 block">Dual-index alignment</span>
              </div>
              <div className="border-l border-[#4a5d70] pl-4">
                <span className="font-mono text-xs font-bold text-[#1a1c1b] block">AESTHETIC</span>
                <span className="font-sans text-[10px] text-[#747878] mt-1 block">Pacing & palette ratios</span>
              </div>
            </div>
          </div>

          {/* Operational Scope informative section (Columns 5) */}
          <div className="lg:col-span-5 bg-white border border-[#e5e5e1] p-8 rounded-lg shadow-museum space-y-6">
            <div>
              <span className="font-sans text-[10px] font-bold text-[#444748] tracking-widest uppercase block mb-1">
                INTELLIGENCE SCOPE
              </span>
              <h3 className="font-display text-xl font-medium text-[#1a1c1b] mb-3">
                Operational Coverage
              </h3>
              <p className="font-sans text-xs text-[#747878] leading-relaxed">
                Curator structures raw video datasets across primary business domains to provide comprehensive strategic coverage.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-[#c47b5f] bg-[#f2e6e1]/75 px-2.5 py-1 rounded-[1.5px] shrink-0">
                  01
                </span>
                <div>
                  <h4 className="font-display text-sm font-semibold text-[#1a1c1b]">Multi-modal Critique</h4>
                  <p className="font-sans text-xs text-[#747878] mt-1">Analyze companion print assets and key art alongside campaign video reels, producing unified creative and design critiques.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-[#1a1c1b] bg-[#eeeeec] px-2.5 py-1 rounded-[1.5px] shrink-0">
                  02
                </span>
                <div>
                  <h4 className="font-display text-sm font-semibold text-[#1a1c1b]">Dual-Layer Search</h4>
                  <p className="font-sans text-xs text-[#747878] mt-1">Index and query spoken dialogue and visual scene composition timelines simultaneously using natural language.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-[#4a5d70] bg-[#e6e8eb]/70 px-2.5 py-1 rounded-[1.5px] shrink-0">
                  03
                </span>
                <div>
                  <h4 className="font-display text-sm font-semibold text-[#1a1c1b]">Chromatic & Font Insights</h4>
                  <p className="font-sans text-xs text-[#747878] mt-1">Extract brand identity vectors including dominant color palettes, typographic matrix ratios, slogans, and 4 pacing beats.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
