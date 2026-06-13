import React, { useState, useEffect } from "react";
import { Palette, Baseline, HelpCircle, Activity, LayoutGrid, Award, Volume2 } from "lucide-react";

interface ReportsScreenProps {
  reportsData: any;
  isLoading: boolean;
  onRefresh: () => void;
  videos: any[];
}

export default function ReportsScreen({ reportsData, isLoading, onRefresh, videos }: ReportsScreenProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");

  useEffect(() => {
    if (videos && videos.length > 0 && !selectedAssetId) {
      setSelectedAssetId(videos[0].id);
    }
  }, [videos]);

  // If data is loading or null, show loading indicator
  if (isLoading || !reportsData) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#c47b5f] border-t-transparent animate-spin" />
        <p className="font-display text-lg text-[#1a1c1b] tracking-wider italic">
          Synthesizing Infographics & Aesthetic Datasets via SenseNova U1...
        </p>
      </div>
    );
  }

  const selectedAsset = videos.find(v => v.id === selectedAssetId) || videos[0] || reportsData;

  const formatSec = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 1. Dominant Palettes
  const dominantPalettes = selectedAsset?.dominantColorPalette?.map((c: any) => ({
    name: c.name,
    value: c.percentage,
    color: c.hex
  })) || [];

  // 2. Typography Ratios modeled from asset sector
  const getTypographyRatios = (asset: any) => {
    const sector = (asset?.sector || "").toLowerCase();
    if (sector.includes("technology") || sector.includes("infrastructure") || sector.includes("security")) {
      return [
        { name: "Serif (Playfair Display)", ratio: 15 },
        { name: "Sans-Serif (Inter)", ratio: 85 }
      ];
    }
    if (sector.includes("logistics") || sector.includes("supply")) {
      return [
        { name: "Serif (Playfair Display)", ratio: 35 },
        { name: "Sans-Serif (Inter)", ratio: 65 }
      ];
    }
    if (sector.includes("retail") || sector.includes("design") || sector.includes("fashion")) {
      return [
        { name: "Serif (Playfair Display)", ratio: 80 },
        { name: "Sans-Serif (Inter)", ratio: 20 }
      ];
    }
    return [
      { name: "Serif (Playfair Display)", ratio: 55 },
      { name: "Sans-Serif (Inter)", ratio: 45 }
    ];
  };
  const typographyRatios = selectedAsset?.typographyRatios || getTypographyRatios(selectedAsset);

  // 3. Narrative pacing beats split into four equal parts of the video
  const pacingBeats = selectedAsset?.pacingBeats || (() => {
    const duration = selectedAsset?.durationSec || 60;
    const quarter = duration / 4;
    return Array.from({ length: 4 }).map((_, idx) => {
      const startSec = Math.floor(idx * quarter);
      const endSec = Math.floor((idx + 1) * quarter);
      const sceneAtTime = selectedAsset?.visualScenes?.find((s: any) => s.start >= startSec && s.start < endSec) || selectedAsset?.visualScenes?.[idx];
      const label = sceneAtTime?.label || `Sequence Phase ${idx + 1}`;
      const color = sceneAtTime?.color || (idx === 0 ? "#1A1A1A" : idx === 1 ? "#4A5D70" : idx === 2 ? "#C47B5F" : "#747878");
      return {
        time: formatSec(startSec),
        name: label,
        desc: `Visual scene alignment pacing segment running from ${formatSec(startSec)} to ${formatSec(endSec)}.`,
        color: color
      };
    });
  })();

  // 4. Dynamic Sentiment trend
  const sentimentTrend = [
    { name: "Week 1", competitorVal: Math.max(0, (selectedAsset?.brandSentimentScore || 10) - 8), targetVal: 20 },
    { name: "Week 2", competitorVal: Math.max(0, (selectedAsset?.brandSentimentScore || 10) - 3), targetVal: 40 },
    { name: "Week 3", competitorVal: Math.max(0, (selectedAsset?.brandSentimentScore || 10) + 2), targetVal: 80 },
    { name: "Week 4", competitorVal: Math.max(0, (selectedAsset?.brandSentimentScore || 10)), targetVal: 95 }
  ];

  // Dynamic visual styling description based on sector
  const getVisualStylingMode = (asset: any) => {
    const sector = (asset?.sector || "").toLowerCase();
    if (sector.includes("technology") || sector.includes("infrastructure") || sector.includes("security")) {
      return "Cool Industrial, blueprints and modular computing.";
    }
    if (sector.includes("logistics") || sector.includes("supply")) {
      return "Pragmatic Workspace, shipping analytics overlays.";
    }
    if (sector.includes("retail") || sector.includes("design") || sector.includes("fashion")) {
      return "Brutalist Modernism, stark tactile textures and marble.";
    }
    return "Editorial Minimalism, geometric structural framing.";
  };

  const thematicClaims = selectedAsset?.thematicFocus?.map((t: any) => t.topic).join(", ") || "N/A";
  
  const slogan = selectedAsset?.slogan 
    ? `"${selectedAsset.slogan}"`
    : (selectedAsset?.spokenTranscript?.[0]?.text 
        ? `"${selectedAsset.spokenTranscript[0].text}"`
        : "No slogan captured.");

  const focusAllocation = selectedAsset?.thematicFocus?.map((t: any) => `${t.percentage}% ${t.topic}`).join(" / ") || "N/A";

  // Render high fidelity mockups with precise SVG geometry
  return (
    <div className="py-12 md:py-16 max-w-[1280px] mx-auto space-y-12">
      
      {/* Editorial Page Header */}
      <header className="max-w-3xl">
        <span className="font-sans text-[10px] font-bold text-[#c47b5f] tracking-widest uppercase mb-3 block">
          Q3 Brand Intelligence & Art Archive
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#1a1c1b] mb-4">
          Aesthetic Trends & Structural Paradigms
        </h1>
        <p className="font-sans text-base text-[#444748] leading-relaxed">
          A curated exhibition of visual intelligence extracted from top-performing competitor luxury campaigns. Analyzing the alignment of color hierarchies, display typographies, and chronological narrative pacing.
        </p>
      </header>

      {/* Brand Asset Selector */}
      {videos && videos.length > 0 && (
        <div className="bg-white border border-[#e5e5e1] p-6 rounded-lg shadow-museum flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="font-sans text-[10px] font-bold text-[#4a5d70] tracking-widest uppercase mb-1 block">
              Select Brand Campaign Target
            </label>
            <span className="font-sans text-xs text-[#747878]">
              Switch between indexed brand assets to decode specific brand intelligence.
            </span>
          </div>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="bg-[#f9f9f7] border border-[#e5e5e1] focus:ring-1 focus:ring-[#c47b5f] focus:outline-none p-2.5 rounded text-sm font-sans font-medium text-[#1a1c1b] min-w-[240px] cursor-pointer"
          >
            {videos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedAsset ? (
        <>
          {/* Grid: Color Theory & Typography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Dominant Palettes (Grid cell - Large) */}
            <article className="lg:col-span-8 bg-white border border-[#e5e5e1] rounded-lg p-8 shadow-museum flex flex-col justify-between">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="font-sans text-[9px] font-bold text-[#c47b5f] tracking-widest uppercase block mb-1">
                    Chromatic Alignment Analysis
                  </span>
                  <h3 className="font-display text-xl font-medium text-[#1a1c1b]">
                    Dominant Palettes
                  </h3>
                  <p className="font-sans text-xs text-[#444748]">
                    Color space allocations across luxury automotive and design campaign vectors.
                  </p>
                </div>
                <span className="p-2 bg-[#f9f9f7] rounded-full text-[#4a5d70]">
                  <Palette className="w-5 h-5" />
                </span>
              </div>

              {/* Precision SVG styled infographic chart */}
              <div className="flex items-end gap-6 h-64 border-b border-[#e5e5e1] pb-6 relative pl-8">
                {/* Y-axis coordinates */}
                <div className="absolute left-0 bottom-6 top-0 flex flex-col justify-between font-sans text-[9px] text-[#444748]">
                  <span>100%</span>
                  <span>50%</span>
                  <span>0%</span>
                </div>

                {dominantPalettes?.map((palette: any, index: number) => {
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      {/* Decorative Tooltip */}
                      <span className="absolute -top-10 bg-[#1a1c1b] text-white text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-[1px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        {palette.value}% ({palette.color})
                      </span>

                      {/* Stylized Bar */}
                      <div 
                        className="w-full rounded-sm shadow-sm transition-all duration-500 overflow-hidden relative cursor-pointer group-hover:scale-102"
                        style={{ 
                          height: `${palette.value * 1.8}px`,
                          backgroundColor: palette.color,
                          border: palette.color === "#f9f9f7" || palette.color === "#ffffff" ? "1px solid #e5e5e1" : "none"
                        }}
                      />

                      {/* Caption name */}
                      <span className="font-sans text-[10px] font-semibold text-[#1a1c1b] tracking-wider uppercase mt-3 text-center truncate w-full">
                        {palette.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Typography Ratios (Grid cell - Small) */}
            <article className="lg:col-span-4 bg-white border border-[#e5e5e1] rounded-lg p-8 shadow-museum flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="font-sans text-[9px] font-bold text-[#c47b5f] tracking-widest uppercase block mb-1">
                    Display & Body Typography Matches
                  </span>
                  <h3 className="font-display text-xl font-medium text-[#1a1c1b]">
                    Typography Matrix
                  </h3>
                </div>
                <span className="p-2 bg-[#f9f9f7] rounded-full text-[#1a1c1b]">
                  <Baseline className="w-5 h-5" />
                </span>
              </div>

              <div className="flex-grow flex flex-col justify-center space-y-8 py-4">
                {typographyRatios?.map((typo: any, index: number) => {
                  return (
                    <div key={index}>
                      <div className="flex justify-between font-sans text-xs font-semibold text-[#1a1c1b] mb-2 leading-none uppercase tracking-wider">
                        <span>{typo.name}</span>
                        <span className="font-mono">{typo.ratio}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f4f4f2] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${index === 0 ? "bg-[#1a1c1b]" : "bg-[#c47b5f]"}`}
                          style={{ width: `${typo.ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="font-sans text-xs text-[#444748] border-t border-[#f4f4f2] pt-4 mt-6 leading-relaxed">
                High-contrast serif typographies dominate opening and title sequences, establishing immediate heritage. Sans-serif configurations handle fast contextual telemetries.
              </p>
            </article>
          </div>

          {/* Campaigns Structures: Temporal Analysis (Bento Cell 3 - Full Width) */}
          <article className="bg-[#ffffff] border border-[#e5e5e1] rounded-xl p-8 md:p-10 shadow-museum">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-[#f4f4f2] pb-5 gap-4">
              <div>
                <span className="font-sans text-[9px] font-bold text-[#c47b5f] tracking-widest uppercase block mb-1">
                  Time Pacing & conversion architecture (SenseNova U1)
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1a1c1b]">
                  Narrative Pacing & Ad Beats
                </h3>
                <p className="font-sans text-xs text-[#444748] mt-1">
                  Timeline pacing mapping indicating key behavioral milestones inside high-value competitor campaign loops.
                </p>
              </div>
              <button 
                onClick={onRefresh}
                className="bg-transparent border border-[#1a1c1b] text-[#1a1c1b] hover:bg-[#1a1c1b] hover:text-white px-5 py-2 rounded-sm font-sans text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Re-Assess Timeline Pacing
              </button>
            </header>

            {/* Timeline graphics */}
            <div className="relative py-12 md:py-16">
              {/* Main timeline axis line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#e5e5e1] -translate-y-1/2" />
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 relative z-10">
                {pacingBeats?.map((beat: any, idx: number) => {
                  return (
                    <div key={idx} className="flex flex-col items-center text-center group">
                      {/* Stylized Marker node */}
                      <div 
                        className="w-5 h-5 rounded-full mb-6 border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-130 cursor-pointer"
                        style={{ backgroundColor: beat.color }}
                      />
                      {/* Time badge */}
                      <span className="font-sans text-xs font-mono font-bold text-[#c47b5f] bg-[#f2e6e1]/70 px-2.5 py-0.5 rounded-sm mb-3">
                        {beat.time}
                      </span>
                      {/* Details */}
                      <h4 className="font-display text-base font-semibold text-[#1a1c1b] mb-1">
                        {beat.name}
                      </h4>
                      <p className="font-sans text-xs text-[#444748] max-w-[200px] leading-relaxed">
                        {beat.desc}
                      </p>
                    </div>
                  );
                })}
                {pacingBeats?.length === 0 && (
                  <p className="font-sans text-xs text-[#444748] italic py-3 text-center col-span-4">
                    No visual pacing elements extracted for this asset.
                  </p>
                )}
              </div>
            </div>
          </article>

          {/* Competitive Trends, Slogans, and Branding Table */}
          <section className="bg-[#ffffff] border border-[#e5e5e1] rounded-xl p-8 shadow-museum">
            <h3 className="font-display text-xl font-medium text-[#1a1c1b] mb-4">
              Competitor Branding Trends & In-Media Claims
            </h3>
            <p className="font-sans text-xs text-[#444748] mb-6">
              Summarizing raw aesthetic choices, competitor slogans, and active value declarations extracted via Curator AI.
            </p>

            <div className="overflow-x-auto border border-[#e5e5e1]/40 rounded">
              <table className="w-full border-collapse text-left font-sans text-xs">
                <thead>
                  <tr className="bg-[#f9f9f7] border-b border-[#e5e5e1]/60 text-[#444748] font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-4">Brand Asset</th>
                    <th className="p-4">Visual Styling Mode</th>
                    <th className="p-4">Dominant Thematic Claims</th>
                    <th className="p-4">Slogan</th>
                    <th className="p-4">Aesthetic Focus Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e5e5e1]/40 hover:bg-[#f9f9f7]/50 transition-colors">
                    <td className="p-4 font-bold text-[#1a1c1b]">{selectedAsset.title}</td>
                    <td className="p-4 text-[#444748]">{getVisualStylingMode(selectedAsset)}</td>
                    <td className="p-4 font-medium text-[#c47b5f]">{thematicClaims}</td>
                    <td className="p-4 italic text-[#444748]">{slogan}</td>
                    <td className="p-4">{focusAllocation}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="py-12 text-center text-[#444748]">
          <p className="font-sans text-sm italic">No active brand campaigns found in the archive database.</p>
        </div>
      )}
    </div>
  );
}
