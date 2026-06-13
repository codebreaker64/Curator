import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Search, Play, Pause, Maximize, Download, Sparkles, CheckCircle2, ChevronRight, Compass, Loader2 } from "lucide-react";

interface SearchScreenProps {
  activeVideo: any;
  onSearchQuery: (query: string) => Promise<any>;
  searchResults: any;
  isSearching: boolean;
  videos: any[];
  onSelectVideo: (assetId: string) => void;
}

export default function SearchScreen({
  activeVideo,
  onSearchQuery,
  searchResults,
  isSearching,
  videos,
  onSelectVideo
}: SearchScreenProps) {
  const [queryInput, setQueryInput] = useState("");
  const [activeTab, setActiveTab] = useState<"spoken" | "visual" | "attachment">("spoken");
  const [videoTime, setVideoTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(1);
  
  // Interactive export modes
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Initialize and reload HLS or direct video when the stream URL or type changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = activeVideo?.streamUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    const isHlsUrl = streamUrl.toLowerCase().includes(".m3u8") || streamUrl.includes("manifest");

    if (Hls.isSupported() && isHlsUrl) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        maxBufferSize: 30 * 1000 * 1000,
        enableWorker: true
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setDuration(video.duration || activeVideo.durationSec || 405);
      });
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = streamUrl;
      video.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeVideo?.streamUrl]);

  // Monitor playback details
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setVideoTime(video.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(video.duration || activeVideo.durationSec);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [activeVideo]);

  useEffect(() => {
    if (activeTab === "attachment" && !activeVideo?.attachedImageUrl) {
      setActiveTab("spoken");
    }
  }, [activeVideo, activeTab]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    if (!isPlaying) {
      video.play().catch(console.error);
    }
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    onSearchQuery(queryInput);
  };

  const formatSec = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleDownloadReport = (format: "txt" | "html" | "video") => {
    if (!activeVideo) return;

    if (format === "video") {
      const videoSrc = activeVideo.streamUrl;
      const link = document.createElement("a");
      link.href = videoSrc;
      link.download = `${activeVideo.title.replace(/\s+/g, "_")}.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    let fileContent = "";
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "txt") {
      fileContent = `======================================================================
CURATOR RECONNAISSANCE INTEL: ${activeVideo.title.toUpperCase()}
======================================================================
Sector: ${activeVideo.sector}
Catalogued: ${activeVideo.detectedTime}
Brand Sentiment Index: ${activeVideo.brandSentimentScore >= 0 ? '+' : ''}${activeVideo.brandSentimentScore}%
Original Link: ${activeVideo.url}
Stream Source: ${activeVideo.streamUrl}

----------------------------------------------------------------------
METADATA DESCRIPTION
----------------------------------------------------------------------
${activeVideo.description}

----------------------------------------------------------------------
DOMINANT COLOR PALETTE
----------------------------------------------------------------------
${activeVideo.dominantColorPalette?.map((c: any) => `- ${c.name}: ${c.percentage}% (${c.hex})`).join("\r\n") || "No colors extracted."}

----------------------------------------------------------------------
CHRONOLOGICAL DECODED VOICE TRANSCRIPTS
----------------------------------------------------------------------
${activeVideo.spokenTranscript?.map((t: any) => `[${t.time}] ${t.label ? `[${t.label.toUpperCase()}] ` : ''}${t.text}`).join("\r\n") || "No dialogues indexed."}

----------------------------------------------------------------------
HIGH-DENSITY VISUAL SCENES SEGMENTATION
----------------------------------------------------------------------
${activeVideo.visualScenes?.map((s: any) => `[${formatSec(s.start)} - ${formatSec(s.end)}] ${s.label}`).join("\r\n") || "No scenes logged."}

======================================================================
GENERATED VIA CURATOR INTEL PORTAL — CC 2026
======================================================================`;
    } else {
      mimeType = "text/html";
      extension = "html";
      fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CURATOR Intelligence Brief - ${activeVideo.title}</title>
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f9f9f7; color: #1a1c1b; margin: 40px auto; max-width: 800px; line-height: 1.6; }
    header { border-bottom: 2px solid #1a1c1b; padding-bottom: 24px; margin-bottom: 40px; }
    h1 { font-family: serif; font-size: 2.5rem; margin: 0 0 10px 0; color: #1a1c1b; }
    .badge { background: #c47b5f; color: white; padding: 4px 8px; font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
    .meta-grid { display: grid; grid-template-cols: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 24px 0; background: white; padding: 20px; border: 1px solid #e5e5e1; }
    .meta-item h4 { margin: 0 0 4px 0; color: #4a5d70; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .meta-item p { margin: 0; font-size: 14px; font-weight: 500; }
    .section-title { font-family: serif; border-bottom: 1px solid #e5e5e1; padding-bottom: 8px; margin-top: 40px; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 12px; font-size: 14px; }
    .time { font-family: monospace; font-weight: bold; color: #c47b5f; margin-right: 12px; }
    .scene-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #f4f4f2; }
    .color-swatch { display: inline-block; width: 12px; height: 12px; border-radius: 50%; vertical-align: middle; margin-right: 6px; }
  </style>
</head>
<body>
  <header>
    <span class="badge">${activeVideo.sector}</span>
    <h1>${activeVideo.title}</h1>
    <p style="color: #747878; margin: 0;">Extrained campaign overview and decoded multi-sensor intelligence briefing.</p>
  </header>

  <p><strong>Exhibition Summary:</strong> ${activeVideo.description}</p>

  <div class="meta-grid">
    <div class="meta-item">
      <h4>Catalogued</h4>
      <p>${activeVideo.detectedTime}</p>
    </div>
    <div class="meta-item">
      <h4>Brand Sentiment</h4>
      <p>${activeVideo.brandSentimentScore >= 0 ? '+' : ''}${activeVideo.brandSentimentScore}%</p>
    </div>
    <div class="meta-item">
      <h4>Source Target</h4>
      <p>${activeVideo.url}</p>
    </div>
  </div>

  <h3 class="section-title">Decoded Voice Audio Dialogue</h3>
  <ul>
    ${activeVideo.spokenTranscript?.map((t: any) => `
      <li>
        <span class="time">${t.time}</span>
        ${t.label ? `<strong style="color: #4a5d70;">[${t.label}]</strong> ` : ''}
        <span>${t.text}</span>
      </li>
    `).join('') || '<li>No transcript logged.</li>'}
  </ul>

  <h3 class="section-title">Visual Layout Scenography</h3>
  <div>
    ${activeVideo.visualScenes?.map((s: any) => `
      <div class="scene-row">
        <div>
          <span class="time">${formatSec(s.start)} - ${formatSec(s.end)}</span>
          <span>${s.label}</span>
        </div>
        <div>
          <span class="color-swatch" style="background-color: ${s.color};"></span>
          <span style="font-size: 11px; font-family: monospace; color: #747878;">${s.color}</span>
        </div>
      </div>
    `).join('') || '<p>No scenes tracked.</p>'}
  </div>

  <footer style="margin-top: 80px; font-size: 10px; text-transform: uppercase; color: #747878; text-align: center; border-t: 1px solid #e5e5e1; padding-top: 20px;">
    CURATOR RECONNAISSANCE PLATFORM — CC 2026
  </footer>
</body>
</html>`;
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8` });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${activeVideo.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-analysis.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    setIsDownloadOpen(false);
  };

  return (
    <div className="py-8 md:py-12 max-w-[1440px] mx-auto h-[calc(100vh-64px)] grid grid-cols-1 md:grid-cols-12 gap-8 overflow-hidden pr-2">
      
      {/* LEFT COLUMN: Cognitive Workspace search controls & listings */}
      <section className="col-span-12 md:col-span-4 flex flex-col h-full overflow-hidden bg-white rounded-lg border border-[#e5e5e1] p-6 shadow-museum shrink-0">
        <div className="mb-6">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#4a5d70] mb-2 block">
            Active Dataset Selection
          </span>
          <select 
            value={activeVideo?.id}
            onChange={(e) => onSelectVideo(e.target.value)}
            className="w-full bg-[#f9f9f7] border border-[#e5e5e1] focus:ring-1 focus:ring-[#c47b5f] focus:outline-none p-2 rounded text-sm font-sans font-medium text-[#1a1c1b] mb-4"
          >
            {videos.map(v => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>

          {/* Core Search Formulation */}
          <form onSubmit={handleQuerySubmit} className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444748]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="Find moments where..."
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              className="w-full bg-[#f9f9f7] border border-[#e5e5e1] border-r-0 focus:ring-1 focus:ring-[#c47b5f] focus:outline-none py-2.5 pl-10 pr-12 rounded-l text-xs font-sans text-[#1a1c1b]"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-0 top-0 bottom-0 bg-[#1a1c1b] text-white hover:bg-[#c47b5f] disabled:bg-[#dadad8] px-4 rounded-r transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Dynamic Cognitive Query Decomposition output panel */}
        <div className="flex-grow overflow-y-auto no-scrollbar space-y-6">
          {isSearching ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#c47b5f]" />
              <p className="font-sans text-xs text-[#444748] tracking-widest uppercase">
                Parsing Cognitive Prompts with Gemini...
              </p>
            </div>
          ) : searchResults ? (
            <div className="space-y-6">
              {/* Deocmposition results */}
              <div className="p-4 bg-[#f9f9f7] rounded border border-[#e5e5e1]/50 space-y-3">
                <div className="flex items-center gap-2 font-sans text-[10px] font-bold text-[#c47b5f] uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kimi 2.6 Multi-Modal Decomposition</span>
                </div>
                <div>
                  <span className="font-sans text-[9px] font-semibold text-[#444748] tracking-wider uppercase block">
                    Spoken-Phrase Semantic Query:
                  </span>
                  <p className="font-sans text-xs italic text-[#1a1c1b]">
                    "{searchResults.cognitiveDecomposition?.spoken_query}"
                  </p>
                </div>
                <div>
                  <span className="font-sans text-[9px] font-semibold text-[#444748] tracking-wider uppercase block">
                    Visual-Scene Extraction query:
                  </span>
                  <p className="font-sans text-xs italic text-[#1a1c1b]">
                    "{searchResults.cognitiveDecomposition?.visual_query}"
                  </p>
                </div>
              </div>

              {/* Match Segment List */}
              <div>
                <span className="font-sans text-[10px] font-bold text-[#444748] tracking-widest uppercase block mb-3 border-b border-[#f4f4f2] pb-1.5">
                  Timeline query segment matches (VideoDB metrics)
                </span>
                <div className="space-y-3">
                  {searchResults.timelineMatches?.map((match: any, index: number) => (
                    <div 
                      key={index}
                      onClick={() => seekTo(match.start)}
                      className="group p-3 hover:bg-[#f9f9f7] border border-[#e5e5e1]/30 rounded cursor-pointer transition-all flex items-start gap-3"
                    >
                      <button className="p-1 bg-[#1a1c1b] text-[#f9f9f7] group-hover:bg-[#c47b5f] rounded-full self-start transition-colors">
                        <Play className="w-3 h-3 fill-white" />
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-sans text-[10px] font-mono tracking-wider font-semibold text-[#4a5d70]">
                            {formatSec(match.start)} - {formatSec(match.end)}
                          </span>
                          <span className="font-sans text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {match.relevance} match
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#1a1c1b] leading-relaxed line-clamp-2">
                          {match.text}
                        </p>
                        <span className="font-sans text-[8px] tracking-widest text-[#444748] uppercase bg-[#eeeeec]/50 px-1.5 py-0.5 rounded-[1px] mt-2 inline-block">
                          {match.match_type} sensor
                        </span>
                      </div>
                    </div>
                  ))}
                  {searchResults.timelineMatches?.length === 0 && (
                    <p className="font-sans text-xs text-[#444748] italic py-3 text-center">
                      No precise search frames generated. Try a broader search.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-[#444748] space-y-3">
              <Compass className="w-8 h-8 mx-auto stroke-1" />
              <p className="font-sans text-xs font-semibold uppercase tracking-widest">
                Search formulated tags
              </p>
              <p className="font-sans text-xs text-[#444748] max-w-xs mx-auto">
                CURATOR will instantly decompose and index spoken layers together with structural visual footage.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RIGHT COLUMN: Video workspace canvases & Player controllers */}
      <section className="col-span-12 md:col-span-8 flex flex-col h-full overflow-hidden justify-between">
        
        {/* Context metadata details header */}
        <header className="flex justify-between items-start md:items-end mb-4 pr-4 relative">
          <div>
            <p className="font-sans text-[10px] font-bold text-[#c47b5f] tracking-widest uppercase mb-1">
              CURATOR EXHIBITION FEED ARCHIVE
            </p>
            <h2 className="font-display text-2xl font-medium text-[#1a1c1b] leading-tight">
              {activeVideo?.title}
            </h2>
          </div>
          <div className="flex gap-2 relative z-50">
            <button 
              id="download-button"
              onClick={() => {
                setIsDownloadOpen(!isDownloadOpen);
              }}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                isDownloadOpen 
                  ? "bg-[#1a1c1b] border-[#1a1c1b] text-white shadow-md"
                  : "border-[#e5e5e1] hover:bg-[#1a1c1b] hover:border-[#1a1c1b] hover:text-white text-[#1a1c1b]"
              }`}
              title="Export Intelligence Brief"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Download Popover modal */}
            {isDownloadOpen && (
              <div className="absolute right-0 top-11 z-50 bg-white border border-[#e5e5e1] p-5 shadow-museum rounded-lg text-left w-80 animate-fadeIn">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#1a1c1b] mb-1.5">
                  Export Intelligence Brief
                </h4>
                <p className="font-sans text-[11px] text-[#747878] mb-4 leading-normal">
                  Download the fully curated chronological telemetry & analysis dossiers.
                </p>

                <div className="space-y-2">
                  <button 
                    onClick={() => handleDownloadReport("txt")}
                    className="w-full bg-[#f9f9f7] hover:bg-[#1a1c1b] hover:text-[#f9f9f7] border border-[#e5e5e1] p-2.5 rounded text-left font-sans text-[10px] font-bold uppercase tracking-wider flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span>1. Text Digest Memo (.txt)</span>
                    <span className="font-mono text-[9px] lowercase opacity-60">txt</span>
                  </button>
                  <button 
                    onClick={() => handleDownloadReport("html")}
                    className="w-full bg-[#f9f9f7] hover:bg-[#1a1c1b] hover:text-[#f9f9f7] border border-[#e5e5e1] p-2.5 rounded text-left font-sans text-[10px] font-bold uppercase tracking-wider flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span>2. Elegant HTML Briefing (.html)</span>
                    <span className="font-mono text-[9px] lowercase opacity-60">html</span>
                  </button>
                  <button 
                    onClick={() => handleDownloadReport("video")}
                    className="w-full bg-[#f9f9f7] hover:bg-[#1a1c1b] hover:text-[#f9f9f7] border border-[#e5e5e1] p-2.5 rounded text-left font-sans text-[10px] font-bold uppercase tracking-wider flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span>3. Raw Stream Backup (.mp4)</span>
                    <span className="font-mono text-[9px] lowercase opacity-60">mp4</span>
                  </button>
                </div>

                <div className="mt-4 flex justify-between border-t border-[#f4f4f2] pt-3">
                  <button 
                    onClick={() => setIsDownloadOpen(false)}
                    className="font-sans text-[10px] text-[#747878] hover:text-[#1a1c1b] font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Video Frame Canvas Player */}
        <div className="flex-grow w-full bg-white shadow-museum rounded-lg p-2.5 relative group flex flex-col overflow-hidden border border-[#e5e5e1]">
          <div className="w-full h-full relative overflow-hidden rounded bg-black flex items-center justify-center z-10 transition-shadow">
            
            {activeVideo?.isImage || activeVideo?.duration === "00:00" ? (
              <img
                src={activeVideo?.streamUrl}
                alt={activeVideo?.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  preload="auto"
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                />

                {/* In-Video Playback Hover Controls overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-6 text-white z-20">
                  <button 
                    onClick={togglePlay}
                    className="text-white hover:text-[#c47b5f] transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                  </button>
                  
                  {/* Play Timeline Scrubber */}
                  <div 
                    className="flex-grow h-1.5 bg-white/30 rounded-full relative cursor-pointer group/bar"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percentage = (e.clientX - rect.left) / rect.width;
                      seekTo(percentage * duration);
                    }}
                  >
                    <div 
                      className="absolute left-0 top-0 h-full bg-[#c47b5f] rounded-full"
                      style={{ width: `${(videoTime / duration) * 100}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
                      style={{ left: `calc(${(videoTime / duration) * 100}% - 7px)` }}
                    />
                  </div>

                  <span className="font-sans text-[10px] tracking-widest font-mono shrink-0">
                    {formatSec(videoTime)} / {formatSec(duration)}
                  </span>

                  <button className="text-white hover:text-[#c47b5f] transition-colors">
                    <Maximize className="w-5 h-5" onClick={() => videoRef.current?.requestFullscreen()} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Playback Milestones & Active timeline segments tracker */}
        <div className="h-56 bg-white shadow-museum rounded-lg border border-[#e5e5e1] p-5 flex flex-col gap-4 mt-6">
          <div className="flex px-4 border-b border-[#e5e5e1]/50 pb-2">
            <button
              onClick={() => setActiveTab("spoken")}
              className={`pb-1 px-3 font-sans text-[10px] font-bold uppercase tracking-wider transition-colors mr-6 ${
                activeTab === "spoken" ? "text-[#1a1c1b] border-b-2 border-[#1a1c1b]" : "text-[#444748] hover:text-[#1a1c1b]"
              }`}
            >
              Spoken Transcript Frame
            </button>
            <button
              onClick={() => setActiveTab("visual")}
              className={`pb-1 px-3 font-sans text-[10px] font-bold uppercase tracking-wider transition-colors mr-6 ${
                activeTab === "visual" ? "text-[#1a1c1b] border-b-2 border-[#1a1c1b]" : "text-[#444748] hover:text-[#1a1c1b]"
              }`}
            >
              Visual Scenes Breakdown
            </button>
            {activeVideo?.attachedImageUrl && (
              <button
                onClick={() => setActiveTab("attachment")}
                className={`pb-1 px-3 font-sans text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "attachment" ? "text-[#1a1c1b] border-b-2 border-[#1a1c1b]" : "text-[#444748] hover:text-[#1a1c1b]"
                }`}
              >
                Attached Campaign Art
              </button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto no-scrollbar space-y-4 px-2">
            {activeTab === "spoken" ? (
              activeVideo?.spokenTranscript?.map((t: any, index: number) => {
                const isPassing = videoTime >= t.seconds && (index === activeVideo.spokenTranscript.length - 1 || videoTime < activeVideo.spokenTranscript[index + 1].seconds);

                return (
                  <div 
                    key={index}
                    onClick={() => seekTo(t.seconds)}
                    className={`flex gap-4 group cursor-pointer p-1.5 rounded transition-all ${
                      isPassing ? "bg-[#f2e6e1]/45 border-l-2 border-[#c47b5f]" : "hover:bg-[#f9f9f7]"
                    }`}
                  >
                    <div className={`w-12 font-sans text-[10px] font-mono font-bold tracking-widest pt-1 shrink-0 ${isPassing ? "text-[#c47b5f]" : "text-[#444748]"}`}>
                      {t.time}
                    </div>
                    <div className="flex-1">
                      <p className={`font-sans text-xs leading-relaxed ${isPassing ? "text-[#1a1c1b] font-medium" : "text-[#444748]"}`}>
                        {t.text}
                      </p>
                      {t.label && (
                        <span className="font-sans text-[8px] text-[#c47b5f] bg-[#f2e6e1]/70 px-1.5 py-0.5 rounded-[1px] mt-1.5 inline-block font-semibold uppercase tracking-wider">
                          {t.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : activeTab === "visual" ? (
              activeVideo?.visualScenes?.map((s: any, index: number) => {
                const isActiveScene = videoTime >= s.start && videoTime <= s.end;

                return (
                  <div 
                    key={index}
                    onClick={() => seekTo(s.start)}
                    className={`flex gap-4 group cursor-pointer p-2.5 rounded transition-all ${
                      isActiveScene ? "bg-[#e5e5e1]/40 border-l-2 border-[#1a1c1b]" : "hover:bg-[#f9f9f7]"
                    }`}
                  >
                    <div className="w-24 font-sans text-[10px] font-mono tracking-widest shrink-0">
                      {formatSec(s.start)} - {formatSec(s.end)}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`font-sans text-xs ${isActiveScene ? "font-bold text-[#1a1c1b]" : "text-[#444748]"}`}>
                        {s.label}
                      </span>
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col md:flex-row gap-6 p-2 h-full items-start">
                <div className="w-full md:w-1/3 max-h-40 overflow-hidden rounded border border-[#e5e5e1]/60 shrink-0 shadow-sm bg-zinc-50">
                  <img
                    src={activeVideo?.attachedImageUrl}
                    alt="Attached Campaign Art"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <span className="font-sans text-[8px] font-bold text-[#c47b5f] tracking-widest uppercase block">
                    Gemini Brand Visual Analysis
                  </span>
                  <p className="font-sans text-xs text-[#1a1c1b] leading-relaxed">
                    {activeVideo?.attachedImageAnalysis || "No visual analysis available."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
