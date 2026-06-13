import React, { useState } from "react";
import { Play, Sparkles, Database, FileText, ArrowRight, TrendingUp, Activity, CheckCircle, HelpCircle } from "lucide-react";

interface DashboardScreenProps {
  videos: any[];
  onSelectVideo: (assetId: string) => void;
  onNavigateToArchive: () => void;
}

export default function DashboardScreen({ videos, onSelectVideo, onNavigateToArchive }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Get first video as featured highlight, fallback to a mock asset if empty
  const featuredVideo = videos[0] || {
    id: "asset-04a-99",
    title: "Metropolis Structural Survey Keynote",
    description: "Competitor 'Alpha' Product Launch detailing structural parameters.",
    duration: "06:45",
    sector: "Technology Infrastructure",
    brandSentimentScore: 12
  };

  return (
    <div className="py-12 md:py-16 max-w-[1280px] mx-auto">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#c47b5f] mb-3 block">
            Executive Control Workspace
          </span>
          <h1 className="font-display text-4xl font-medium text-[#1a1c1b]">
            Executive Dashboard
          </h1>
          <p className="font-sans text-xs text-[#747878] mt-1">
            Real-time visual monitoring, brand strategy alignments, and computed anomalies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Archiver Sync OK
          </span>
        </div>
      </div>

      {/* Main Grid matching Image 3 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Left 8 columns: Curated highlights & Recents */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* AI-Curated Highlights segment */}
          <section className="bg-white border border-[#e5e5e1] rounded-lg p-6 shadow-museum">
            <div className="flex justify-between items-center mb-6">
              <span className="font-sans text-[10px] font-bold text-[#c47b5f] tracking-widest uppercase">
                AI-Curated Highlights
              </span>
              <span className="font-sans text-[9px] font-mono text-[#747878] uppercase">
                Updated 14 mins ago
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Media preview block */}
              <div className="md:col-span-5 border border-[#e5e5e1] p-1 bg-[#f9f9f7] rounded relative aspect-video overflow-hidden">
                <div className="w-full h-full bg-[#1a1c1b] flex flex-col justify-between p-4 text-white">
                  <div className="flex justify-between font-mono text-[8px] opacity-80">
                    <span>SECTOR_INTEL</span>
                    <span>{featuredVideo.duration}</span>
                  </div>
                  <button 
                    onClick={() => onSelectVideo(featuredVideo.id)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white text-white hover:text-[#1a1c1b] flex items-center justify-center self-center transition-all shadow-md group-hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  <span className="font-sans text-[10px] font-bold truncate">
                    {featuredVideo.title}
                  </span>
                </div>
              </div>

              {/* Insights Panel */}
              <div className="md:col-span-7 space-y-4">
                <span className="font-sans text-[9px] font-bold text-[#4a5d70] tracking-widest uppercase block">
                  Insight Details
                </span>
                
                <div className="space-y-3">
                  <p className="font-sans text-xs text-[#1a1c1b] leading-relaxed font-semibold">
                    {featuredVideo.description}
                  </p>
                  
                  {/* Extracted timeline highlights */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-sans text-[#444748]">
                      <span className="w-1.5 h-1.5 bg-[#c47b5f] rounded-full" />
                      <span>Decentralized strategic cloud rollouts (01:25)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-sans text-[#444748]">
                      <span className="w-1.5 h-1.5 bg-[#4a5d70] rounded-full" />
                      <span> facade stress anomaly structural pattern (02:14)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => onSelectVideo(featuredVideo.id)}
                    className="bg-[#1a1c1b] text-white hover:bg-[#c47b5f] px-6 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    <span>Generate Instant Recap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Recently Detected Content Horizontal Swiper Section */}
          <section>
            <div className="flex justify-between items-end border-b border-[#e5e5e1]/60 pb-3 mb-6">
              <h3 className="font-display text-lg font-medium text-[#1a1c1b]">
                Recently Detected Content
              </h3>
              <button 
                onClick={onNavigateToArchive}
                className="font-sans text-[10px] font-bold uppercase text-[#c47b5f] tracking-widest hover:text-[#1a1c1b] transition-colors"
              >
                View Full Archive
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.slice(0, 4).map(v => (
                <div 
                  key={v.id}
                  onClick={() => onSelectVideo(v.id)}
                  className="bg-white border border-[#e5e5e1] hover:border-[#1a1c1b] p-4 rounded flex gap-4 cursor-pointer group transition-all"
                >
                  <div className="w-20 h-16 bg-[#f9f9f7] border border-[#e5e5e1] rounded flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5 text-[#4a5d70] opacity-55" />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="font-display text-xs font-bold text-[#1a1c1b] line-clamp-1 group-hover:text-[#c47b5f] transition-colors">
                        {v.title}
                      </h4>
                      <p className="font-sans text-[11px] text-[#747878] line-clamp-1 mt-1">
                        {v.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-[#444748]">
                      <span>{v.duration}</span>
                      <span className="uppercase text-[8px] bg-[#eeeeec] px-1.5 py-0.5 rounded-sm">{v.sector?.split(" ")[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right 4 columns: Competitor Trend shifts */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Competitor Trend Shifts line graph representation using custom clean design */}
          <section className="bg-white border border-[#e5e5e1] rounded-lg p-6 shadow-museum flex flex-col justify-between">
            <div>
              <span className="font-sans text-[9px] font-bold text-[#c47b5f] tracking-widest uppercase block mb-1">
                Visual Analytics Hub
              </span>
              <h3 className="font-display text-lg font-medium text-[#1a1c1b] mb-4">
                Competitor Trend Shifts
              </h3>
              <p className="font-sans text-xs text-[#747878] mb-6 leading-relaxed">
                Aggressive corporate shift mappings generated from recent ingested dialogues and theme weights.
              </p>
            </div>

            {/* Stylized custom SVG graph detailing curves */}
            <div className="relative pt-4 pb-6 border-b border-[#f4f4f2]">
              <div className="h-40 w-full relative">
                {/* Background gridlines */}
                <div className="absolute inset-x-0 top-0 h-px bg-[#e5e5e1]/40" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-[#e5e5e1]/40" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-[#e5e5e1]/40" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-[#e5e5e1]/60" />

                {/* Drawn Curves in SVG */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Competitor Curve */}
                  <path 
                    d="M 0 80 Q 25 75, 50 60 T 100 20" 
                    fill="none" 
                    stroke="#c47b5f" 
                    strokeWidth="2"
                    className="relative z-10"
                  />
                  {/* Our Standard Curve */}
                  <path 
                    d="M 0 50 Q 25 45, 50 55 T 100 35" 
                    fill="none" 
                    stroke="#1a1c1b" 
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className="relative z-10"
                  />
                </svg>
              </div>

              {/* Data legends */}
              <div className="flex justify-between text-[9px] font-mono text-[#747878] mt-3 uppercase tracking-wider">
                <span>Jun 01</span>
                <span>Jun 08</span>
                <span>Jun 15</span>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c47b5f]" />
                <div className="flex-1 flex justify-between text-xs font-sans">
                  <span className="text-[#444748]">Rival Innovation Spikes</span>
                  <span className="font-semibold font-mono text-[#1a1c1b]">+18.5%</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1a1c1b] border border-dashed border-[#e5e5e1]" />
                <div className="flex-1 flex justify-between text-xs font-sans">
                  <span className="text-[#444748]">Standard Quality Base</span>
                  <span className="font-semibold font-mono text-[#1a1c1b]">Consistent</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Platform Status */}
          <section className="bg-[#f9f9f7] border border-[#e5e5e1]/70 p-6 rounded">
            <h4 className="font-display text-xs font-bold text-[#1a1c1b] mb-2 uppercase tracking-wide">
              Cognitive Performance Node
            </h4>
            <p className="font-sans text-xs text-[#747878] leading-relaxed mb-4">
              91.2% Context caching efficiency active. Platform is bypassing repetitive prompts automatically.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#1a1c1b]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Response latency: 124ms</span>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
