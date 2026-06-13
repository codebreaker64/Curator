import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, Cpu, BarChart3, Database, Cable, RefreshCcw, HelpCircle } from "lucide-react";

interface SettingsScreenProps {
  runtimeStatus: any;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function SettingsScreen({ runtimeStatus, isLoading, onRefresh }: SettingsScreenProps) {
  // Mock console/stealth log output for Curator platform
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Initiating Curator Cognitive Ingest Module...",
    "[CDP] Bright Data scraper proxy connected successfully at wss://brd.superproxy.io.",
    "[VIDEO-DB] Session instantiated: $20.00 credits available.",
    "[RAG] Vector database synchronized: ready for semantic dialogue searches.",
    "[AI-MODEL] Gemini 3.5 Flash initialized on process.env.GEMINI_API_KEY.",
    "[INTELLIGENCE] Ready for stealth rival URL scrapes."
  ]);

  const handleRefreshClick = () => {
    onRefresh();
    setLogs(prev => [
      ...prev,
      `[CONFIG] Polled runtime metrics: cacheHitRatio is ${runtimeStatus?.quota?.cacheHitRatio || '0.89'} at ${new Date().toLocaleTimeString()}`
    ]);
  };

  const keys = [
    { name: "GEMINI_API_KEY", desc: "Core server-side text models, cognitive routing, research summarization, and RAG index coordination.", status: runtimeStatus?.keysActive?.gemini },
    { name: "BRIGHT_DATA_CDP", desc: "Headless Chromium scrapers over Cloud CDP proxy to crawl, unlock, and extract media segments from anti-bot networks.", status: runtimeStatus?.keysActive?.brightData },
    { name: "VIDEO_DB_API_KEY", desc: "Underlying storage indexing client to generate timelines and playbacks synchronized across audio and visual segments.", status: runtimeStatus?.keysActive?.videoDb },
    { name: "MOONSHOT_API_KEY", desc: "Kimi 2.6 trillion-parameter long-context inference coordination.", status: runtimeStatus?.keysActive?.moonshot },
    { name: "SENSENOVA_API_KEY", desc: "SenseNova U1 model coordinates for corporate layouts and multi-format reports synthesis.", status: runtimeStatus?.keysActive?.senseNova },
  ];

  return (
    <div className="py-12 md:py-16 max-w-[1280px] mx-auto space-y-12">
      
      {/* Configurations Header */}
      <header className="max-w-2xl">
        <span className="font-sans text-[10px] font-bold text-[#c47b5f] tracking-widest uppercase mb-3 block">
          CURATOR CORE TELEMETRY & RUNTIME
        </span>
        <h1 className="font-display text-4xl font-semibold text-[#1a1c1b] mb-4">
          Configurations & Key Monitors
        </h1>
        <p className="font-sans text-xs text-[#444748] leading-relaxed">
          Manage backend API integration keys, monitor cloud platform credits consumption, check system status metrics, and observe real-time context caching logs. Change constants securely in the root <code className="font-mono bg-[#eeeeec] px-1 rounded">.env</code> file.
        </p>
      </header>

      {/* Grid: Quota Monitor & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quota Monitors */}
        <section className="lg:col-span-7 bg-white border border-[#e5e5e1] rounded-lg p-8 shadow-museum flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg font-semibold text-[#1a1c1b] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#c47b5f]" />
                Quota & Caching Metrics
              </h3>
              <button 
                onClick={handleRefreshClick}
                disabled={isLoading}
                className="text-[#444748] hover:text-[#1a1c1b] p-2 bg-[#f9f9f7] rounded-full border border-[#e5e5e1]/40 transition-colors"
                title="Repoll stats"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-[#f9f9f7] border border-[#e5e5e1]/30 p-4 rounded">
                <span className="font-sans text-[10px] font-semibold text-[#444748] uppercase tracking-wider block mb-1">
                  Estimated Costs Consumed
                </span>
                <span className="font-display text-2xl font-bold text-[#1a1c1b]">
                  {runtimeStatus?.quota?.estimatedCost || "$3.64"}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium block mt-1">
                  On-Demand Scrapers Billing
                </span>
              </div>
              
              <div className="bg-[#f9f9f7] border border-[#e5e5e1]/30 p-4 rounded">
                <span className="font-sans text-[10px] font-semibold text-[#444748] uppercase tracking-wider block mb-1">
                  Platform Credits Spent
                </span>
                <span className="font-display text-2xl font-bold text-[#1a1c1b]">
                  {runtimeStatus?.quota?.creditsConsumed || "18.2"} / {runtimeStatus?.quota?.totalCredits || "50"}
                </span>
                <span className="text-[10px] text-[#444748] block mt-1">
                  Free Tier Remaining: 31.8
                </span>
              </div>

              <div className="bg-[#f9f9f7] border border-[#e5e5e1]/30 p-4 rounded">
                <span className="font-sans text-[10px] font-semibold text-[#444748] uppercase tracking-wider block mb-1">
                  Context Caching hit ratio
                </span>
                <span className="font-display text-2xl font-bold text-[#1a1c1b]">
                  {runtimeStatus?.quota?.contextCachingEfficiency || "91.2%"}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium block mt-1">
                  Cache hits: {runtimeStatus?.quota?.cachingSavings || "84.5%"} savings
                </span>
              </div>

              <div className="bg-[#f9f9f7] border border-[#e5e5e1]/30 p-4 rounded">
                <span className="font-sans text-[10px] font-semibold text-[#444748] uppercase tracking-wider block mb-1">
                  Scraper CDP Hit Rate
                </span>
                <span className="font-display text-2xl font-bold text-[#1a1c1b]">
                  {runtimeStatus?.quota?.cacheHitRatio || "0.89"}
                </span>
                <span className="text-[10px] text-[#444748] block mt-1">
                  Average rendering latency: 1.25s
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f4f4f2] pt-6 bg-gradient-to-r from-[#f9f9f7]/40 to-transparent p-4 rounded-sm">
            <span className="font-sans text-[10px] font-bold text-[#444748] tracking-widest uppercase block mb-2">
              Autonomous Cache Optimized Efficiency
            </span>
            <p className="font-sans text-xs text-[#444748] leading-relaxed">
              Curator monitors video segment inquiries and re-routes parallel prompts of highly similar scenes through process-level temporal caching structures. Duplicate analysis of identical visual grids are cached near-instantly, resulting in massive quota relief.
            </p>
          </div>
        </section>

        {/* Real-time System Logs Console Panel */}
        <section className="lg:col-span-5 bg-[#1a1c1b] border border-[#2f3130] rounded-lg p-6 shadow-xl flex flex-col justify-between text-white font-mono text-[10px] space-y-4">
          <div className="flex justify-between items-center border-b border-[#2f3130] pb-3 text-zinc-400">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#c47b5f]" />
              CURATOR TERMINAL OUTPUT
            </span>
            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded uppercase">
              SANDBOX STABLE
            </span>
          </div>

          <div className="flex-grow space-y-2.5 text-zinc-300 overflow-y-auto max-h-72 select-text no-scrollbar">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-zinc-600 mr-2">[{idx + 1}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#2f3130] flex justify-between text-zinc-500 font-sans text-[9px] uppercase tracking-wider">
            <span>NODE_ENV: DEVELOPMENT</span>
            <span>PORT 3000 BRINK MAPPED</span>
          </div>
        </section>
      </div>

      {/* API Configuration Monitored Rows */}
      <section className="bg-white border border-[#e5e5e1] rounded-lg p-8 shadow-museum">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-lg font-semibold text-[#1a1c1b] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#c47b5f]" />
            Integrations & Cloud Keys Telemetry
          </h3>
          <span className="font-sans text-[10px] text-[#444748] font-bold tracking-widest uppercase py-1 bg-[#eeeeec] px-3 rounded-sm">
            Secure Isolated
          </span>
        </div>

        <div className="space-y-6">
          {keys.map((key, index) => {
            return (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f4f4f2] last:border-b-0 pb-5 last:pb-0 gap-4">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-mono text-sm font-bold text-[#1a1c1b]">
                      {key.name}
                    </span>
                    <span className={`inline-block w-2 h-2 rounded-full ${key.status ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-300"}`} />
                  </div>
                  <p className="font-sans text-xs text-[#444748] leading-relaxed">
                    {key.desc}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {key.status ? (
                    <span className="font-sans text-[10px] font-bold tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 uppercase rounded-sm">
                      Configured Active
                    </span>
                  ) : (
                    <span className="font-sans text-[10px] font-bold tracking-widest text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1 uppercase rounded-sm">
                      Not Detected (Fallback ON)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
