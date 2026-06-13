import React, { useState } from "react";
import { Search, Link2, Loader2, ArrowRight, Database, FileText, X } from "lucide-react";

interface ArchiveScreenProps {
  videos: any[];
  onAddUrl: (url: string) => Promise<any>;
  onUploadFile?: (fileInfo: { file: File; filename: string; title: string; streamUrl: string; duration: string; url?: string; imageFile?: File }) => Promise<any>;
  isLoading: boolean;
  onSelectVideo: (assetId: string) => void;
  mode?: "ingest" | "archive";
}

export default function ArchiveScreen({
  videos,
  onAddUrl,
  onUploadFile,
  isLoading,
  onSelectVideo,
  mode = "archive"
}: ArchiveScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [titleInput, setTitleInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [scrapeStep, setScrapeStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);

  const steps = [
    "Establishing secure CDP connection to Bright Data scrapers...",
    "Bypassing Cloudflare protection and anti-bot walls...",
    "Spawning headless browser, rendering Javascript layouts...",
    "Scanning source DOM for video tags, transcription, and scene maps...",
    "Registering discovered raw video stream in VideoDB cloud indices...",
    "Dual-indexing spoken words (video.index_spoken_words()) & scene highlights..."
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isValid = file.type.startsWith("video/");
      if (isValid) {
        setSelectedFile(file);
      } else {
        alert("Please select a valid video file.");
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isValid = file.type.startsWith("video/");
      if (isValid) {
        setSelectedFile(file);
      } else {
        alert("Please select a valid video file.");
      }
    }
  };

  const handleImageDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setImageDragActive(true);
    } else if (e.type === "dragleave") {
      setImageDragActive(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isValid = file.type.startsWith("image/");
      if (isValid) {
        setSelectedImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        alert("Please select a valid image file.");
      }
    }
  };

  const handleImageFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isValid = file.type.startsWith("image/");
      if (isValid) {
        setSelectedImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        alert("Please select a valid image file.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Create local object URL for playback
    const objectUrl = URL.createObjectURL(selectedFile);
    let finalDuration = "02:40";

    // Auto-compute duration from file if possible
    try {
      const tempVideo = document.createElement("video");
      tempVideo.src = objectUrl;
      await new Promise<void>((resolve) => {
        tempVideo.onloadedmetadata = () => {
          const minutes = Math.floor(tempVideo.duration / 60);
          const seconds = Math.floor(tempVideo.duration % 60);
          finalDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          resolve();
        };
        // fallback after 1 second if loading metadata fails/stalls
        setTimeout(resolve, 1000);
      });
    } catch {
      // Fallback duration
    }

    setScrapeStep(0);
    const interval = setInterval(() => {
      setScrapeStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1200);

    try {
      if (onUploadFile) {
        await onUploadFile({
          file: selectedFile,
          filename: selectedFile.name,
          title: titleInput.trim(),
          streamUrl: objectUrl,
          duration: finalDuration,
          url: urlInput.trim() || undefined,
          imageFile: selectedImageFile || undefined
        });
      }
      setSelectedFile(null);
      setSelectedImageFile(null);
      setImagePreviewUrl("");
      setTitleInput("");
      setUrlInput("");
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
    }
  };

  // Filter video list based on local search input
  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchInput.toLowerCase()) ||
    v.description.toLowerCase().includes(searchInput.toLowerCase()) ||
    v.sector.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="py-12 md:py-16 max-w-[1280px] mx-auto space-y-12">
      
      {/* Page Header */}
      <div className="pb-6 border-b border-[#e5e5e1]/60">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#c47b5f] mb-3 block">
          {mode === "ingest" ? "Asset Ingestion Console" : "Digital Asset Repository"}
        </span>
        <h1 className="font-display text-4xl font-medium text-[#1a1c1b]">
          {mode === "ingest" ? "Upload Asset" : "Archive"}
        </h1>
        <p className="font-sans text-xs text-[#747878] mt-1">
          {mode === "ingest"
            ? "Upload competitor campaign videos and specify reference links to dual-index and parse insights."
            : "Browse, search, and analyze your curated library of competitor brand campaigns."
          }
        </p>
      </div>

      {/* Ingestion Console Form (Only visible in Ingest mode) */}
      {mode === "ingest" && (
        <div className="bg-white shadow-museum rounded-lg border border-[#e5e5e1] p-8 animate-fadeIn max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video File Upload Zone */}
            <div>
              <label className="font-sans text-[9px] font-bold text-[#4a5d70] uppercase tracking-widest mb-2 block">
                Video File (Required)
              </label>
              
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    dragActive ? "border-[#c47b5f] bg-[#f2e6e1]/20" : "border-[#e5e5e1] hover:border-[#1a1c1b] bg-[#f9f9f7]/40"
                  } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
                  onClick={() => !isLoading && document.getElementById("file-upload")?.click()}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileInputChange}
                    disabled={isLoading}
                    required
                  />
                  
                  <span className="p-4 bg-white border border-[#e5e5e1] text-[#c47b5f] rounded-full mb-4 shadow-sm">
                    <Database className="w-6 h-6 stroke-1" />
                  </span>
                  
                  <h4 className="font-display text-sm font-semibold text-[#1a1c1b] mb-1">
                    Drag & drop local video here
                  </h4>
                  <p className="font-sans text-xs text-[#747878] max-w-sm">
                    Supports MP4, M3U8, MOV, or WEBM.
                  </p>
                  <span className="font-sans text-[10px] uppercase font-bold text-[#c47b5f] mt-4 tracking-wider underline">
                    Or select video file manually
                  </span>
                </div>
              ) : (
                <div className="bg-[#f9f9f7] border border-[#e5e5e1] rounded p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white border border-[#e5e5e1] text-[#c47b5f] rounded">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-sans text-xs font-semibold text-[#1a1c1b] truncate max-w-md">
                        {selectedFile.name}
                      </p>
                      <p className="font-sans text-[10px] text-[#747878]">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-[#e5e5e1] rounded transition-colors text-[#747878]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Campaign Image Attachment Zone (Optional) */}
            <div>
              <label className="font-sans text-[9px] font-bold text-[#4a5d70] uppercase tracking-widest mb-2 block">
                Campaign Image Attachment (Optional)
              </label>
              
              {!selectedImageFile ? (
                <div
                  onDragEnter={handleImageDrag}
                  onDragOver={handleImageDrag}
                  onDragLeave={handleImageDrag}
                  onDrop={handleImageDrop}
                  className={`relative border border-dashed rounded p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    imageDragActive ? "border-[#c47b5f] bg-[#f2e6e1]/20" : "border-[#e5e5e1] hover:border-[#1a1c1b] bg-[#f9f9f7]/40"
                  } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
                  onClick={() => !isLoading && document.getElementById("image-upload")?.click()}
                >
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageFileInputChange}
                    disabled={isLoading}
                  />
                  
                  <span className="p-2.5 bg-white border border-[#e5e5e1] text-[#c47b5f] rounded-full mb-2 shadow-sm">
                    <FileText className="w-4 h-4 stroke-1" />
                  </span>
                  
                  <h5 className="font-display text-xs font-semibold text-[#1a1c1b] mb-1">
                    Drag & drop campaign key art or print image
                  </h5>
                  <p className="font-sans text-[10px] text-[#747878] max-w-sm">
                    Supports PNG, JPG, or WEBP.
                  </p>
                </div>
              ) : (
                <div className="bg-[#f9f9f7] border border-[#e5e5e1] rounded p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {imagePreviewUrl ? (
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded border border-[#e5e5e1]"
                      />
                    ) : (
                      <span className="p-2 bg-white border border-[#e5e5e1] text-[#c47b5f] rounded">
                        <FileText className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <p className="font-sans text-xs font-semibold text-[#1a1c1b] truncate max-w-xs">
                        {selectedImageFile.name}
                      </p>
                      <p className="font-sans text-[10px] text-[#747878]">
                        {(selectedImageFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageFile(null);
                        setImagePreviewUrl("");
                      }}
                      className="p-1 hover:bg-[#e5e5e1] rounded transition-colors text-[#747878]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Brand / Video Title */}
            <div>
              <label className="font-sans text-[9px] font-bold text-[#4a5d70] uppercase tracking-widest mb-2 block">
                Brand / Video Title (Required)
              </label>
              <input
                type="text"
                required
                disabled={isLoading}
                placeholder="e.g. Prada Autumn Collection Keynote"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                className="w-full bg-[#f9f9f7] border border-[#e5e5e1] focus:ring-1 focus:ring-[#c47b5f] focus:outline-none py-3.5 px-4 rounded text-xs font-sans text-[#1a1c1b]"
              />
            </div>

            {/* Optional URL/Link Input */}
            <div>
              <label className="font-sans text-[9px] font-bold text-[#4a5d70] uppercase tracking-widest mb-2 block">
                Reference Link / Campaign URL (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444748]">
                  <Link2 className="w-4 h-4" />
                </span>
                <input
                  type="url"
                  disabled={isLoading}
                  placeholder="https://competitor.com/campaigns/autumn-collection"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full bg-[#f9f9f7] border border-[#e5e5e1] focus:ring-1 focus:ring-[#c47b5f] focus:outline-none py-3.5 pl-12 pr-4 rounded text-xs font-sans text-[#1a1c1b]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !selectedFile || !titleInput.trim()}
              className="w-full bg-[#1a1c1b] text-[#f9f9f7] hover:bg-[#c47b5f] disabled:bg-[#dadad8] py-4 rounded-sm font-sans text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? "Ingesting..." : "Ingest Asset"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* CDP Progress indicator */}
          {isLoading && (
            <div className="mt-6 pt-6 border-t border-[#f4f4f2] flex items-start gap-4">
              <span className="p-2.5 bg-[#f2e6e1] text-[#c47b5f] rounded-full">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
              <div className="flex-1">
                <span className="font-sans text-[9px] font-bold text-[#c47b5f] uppercase tracking-widest mb-1 block">
                  Active Playwright CDP crawling proxy
                </span>
                <p className="font-sans text-xs font-semibold text-[#1a1c1b]">
                  {steps[scrapeStep]}
                </p>
                <div className="w-full h-1 bg-[#eeeeec] rounded-full overflow-hidden mt-2.5">
                  <div
                    className="h-full bg-[#c47b5f] transition-all duration-1000"
                    style={{ width: `${((scrapeStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Archive Matrix / List (Only visible in Archive mode) */}
      {mode === "archive" && (
        <>
          {/* Discover Search bar across archive */}
          <div className="bg-white border border-[#e5e5e1] rounded-lg p-6 shadow-museum">
            <span className="font-sans text-[9px] font-bold text-[#c47b5f] tracking-widest uppercase block mb-3">
              Instant Filtering Matrix
            </span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444748]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search files across fully customized indexes..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full bg-[#f9f9f7] border border-[#e5e5e1] focus:ring-1 focus:ring-[#c47b5f] focus:outline-none py-3.5 pl-12 pr-4 rounded text-xs font-sans text-[#1a1c1b]"
              />
            </div>
          </div>

          {/* Grid listing files inside archive */}
          <div className="space-y-6">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-[#444748] border-b border-[#f4f4f2] pb-2">
              <span>Recent Archives Mounted</span>
              <span>{filteredVideos.length} matching indices</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVideos.map(asset => {
                return (
                  <div
                    key={asset.id}
                    className="bg-white border border-[#e5e5e1] hover:border-[#1a1c1b] rounded p-6 shadow-museum flex flex-col justify-between group transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-bold text-[#4a5d70] bg-[#f9f9f7] border border-[#e5e5e1]/40 px-2 py-0.5 rounded-[1px]">
                          {asset.sector}
                        </span>
                        <span className="font-mono text-[9px] text-[#747878]">
                          {asset.duration}
                        </span>
                      </div>

                      {asset.attachedImageUrl && (
                        <div className="w-full h-32 overflow-hidden rounded mb-4 border border-[#e5e5e1]/45">
                          <img
                            src={asset.attachedImageUrl}
                            alt={asset.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <h3 className="font-display text-base font-semibold text-[#1a1c1b] mb-2 leading-snug group-hover:text-[#c47b5f] transition-colors">
                        {asset.title}
                      </h3>
                      <p className="font-sans text-xs text-[#747878] leading-relaxed line-clamp-3 mb-6">
                        {asset.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#f4f4f2] flex justify-between items-center bg-[#f9f9f7] px-3 py-2 rounded">
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#444748]">
                        <FileText className="w-3.5 h-3.5 text-[#4a5d70]" />
                        <span>{asset.spokenTranscript ? asset.spokenTranscript.length : 0} Dialogues</span>
                      </div>
                      
                      <button
                        onClick={() => onSelectVideo(asset.id)}
                        className="text-xs font-bold text-[#1a1c1b] group-hover:text-[#c47b5f] transition-colors uppercase tracking-wider flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        Analyze <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredVideos.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-400 font-sans text-xs italic">
                  No archives matched your search criteria.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
