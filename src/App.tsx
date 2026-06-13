import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingScreen from "./components/LandingScreen";
import DashboardScreen from "./components/DashboardScreen";
import ArchiveScreen from "./components/ArchiveScreen";
import SearchScreen from "./components/SearchScreen";
import ReportsScreen from "./components/ReportsScreen";

export default function App() {
  const [currentScreen, setScreen] = useState<string>("landing");
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  
  const [isLoadingScrape, setIsLoadingScrape] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Load and fetch initial competitor data feeds on mount
  useEffect(() => {
    fetchVideos();
    fetchReports();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const json = await res.json();
      if (json.success && json.videos) {
        setVideos(json.videos);
        if (json.videos.length > 0) {
          const selectedVideo = json.videos[0];
          setActiveVideo(selectedVideo);
        }
      }
    } catch (e) {
      console.error("Failed to load initial competitor list:", e);
    }
  };

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch("/api/reports-summary");
      const json = await res.json();
      if (json.success && json.data) {
        setReportsData(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch analytical reports:", e);
    } finally {
      setIsLoadingReports(false);
    }
  };



  const handleAddUrl = async (url: string) => {
    setIsLoadingScrape(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const json = await res.json();
      if (json.success && json.asset) {
        setVideos(prev => [json.asset, ...prev]);
        setActiveVideo(json.asset);
        // Refresh telemetry or summaries since new content is loaded
        fetchReports();
        
        setSearchResults(null);
        setScreen("analysis");
        return json.asset;
      } else {
        throw new Error(json.error || "Ingestion target failure.");
      }
    } catch (e) {
      console.error(e);
      alert("Intelligence Ingest Failed: Gemini analysis or proxy rendering is delayed.");
      throw e;
    } finally {
      setIsLoadingScrape(false);
    }
  };

  const handleUploadFile = async (fileInfo: { file: File; filename: string; title: string; streamUrl: string; duration: string; url?: string; imageFile?: File }) => {
    setIsLoadingScrape(true);
    try {
      const formData = new FormData();
      formData.append("video", fileInfo.file);
      formData.append("title", fileInfo.title);
      formData.append("filename", fileInfo.filename);
      formData.append("streamUrl", fileInfo.streamUrl);
      formData.append("duration", fileInfo.duration);
      if (fileInfo.url) {
        formData.append("url", fileInfo.url);
      }
      if (fileInfo.imageFile) {
        formData.append("image", fileInfo.imageFile);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const json = await res.json();
      if (json.success && json.asset) {
        setVideos(prev => [json.asset, ...prev]);
        setActiveVideo(json.asset);
        // Refresh telemetry or summaries since new content is loaded
        fetchReports();

        setSearchResults(null);
        setScreen("analysis");
        return json.asset;
      } else {
        throw new Error(json.error || "File ingestion failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Local File Ingest Failed: VideoDB analysis or indexing is delayed.");
      throw e;
    } finally {
      setIsLoadingScrape(false);
    }
  };

  const handleSearchQuery = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query, 
          activeAssetId: activeVideo?.id 
        })
      });
      const json = await res.json();
      if (json.success) {
        setSearchResults(json);
      }
    } catch (e) {
      console.error("Search query failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectVideo = (assetId: string) => {
    const selected = videos.find(v => v.id === assetId);
    if (selected) {
      setActiveVideo(selected);
      // Reset search results for clean context shift
      setSearchResults(null);
      // Automatically route user into the Cognitive Search screen for immediate action!
      setScreen("analysis");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#1a1c1b] font-sans antialiased selection:bg-[#dadad8] flex flex-col">
      {/* Top sticky curated Command Bar */}
      <Navbar 
        currentScreen={currentScreen} 
        setScreen={setScreen} 
        onUploadClick={() => setScreen("ingest")}
      />

      {/* Main Screen canvas using dynamic switching */}
      <main className="flex-grow px-6 md:px-16 pb-16">
        {currentScreen === "landing" && (
          <LandingScreen 
            onExplore={() => setScreen("dashboard")}
            onRequestAccess={() => alert("Registration system currently locked for the demo. Explore active features in the Archive.")}
          />
        )}

        {currentScreen === "dashboard" && (
          <DashboardScreen 
            videos={videos} 
            onSelectVideo={handleSelectVideo}
            onNavigateToArchive={() => setScreen("archive")}
          />
        )}

        {currentScreen === "ingest" && (
          <ArchiveScreen 
            videos={videos} 
            onAddUrl={handleAddUrl} 
            onUploadFile={handleUploadFile}
            isLoading={isLoadingScrape} 
            onSelectVideo={handleSelectVideo}
            mode="ingest"
          />
        )}

        {currentScreen === "archive" && (
          <ArchiveScreen 
            videos={videos} 
            onAddUrl={handleAddUrl} 
            onUploadFile={handleUploadFile}
            isLoading={isLoadingScrape} 
            onSelectVideo={handleSelectVideo}
            mode="archive"
          />
        )}

        {currentScreen === "analysis" && (
          <SearchScreen 
            activeVideo={activeVideo} 
            onSearchQuery={handleSearchQuery} 
            searchResults={searchResults} 
            isSearching={isSearching}
            videos={videos}
            onSelectVideo={handleSelectVideo}
          />
        )}

        {currentScreen === "insights" && (
          <ReportsScreen 
            reportsData={reportsData} 
            isLoading={isLoadingReports} 
            onRefresh={fetchReports}
            videos={videos}
          />
        )}


      </main>

      {/* Footer gallery line */}
      <footer className="bg-[#f9f9f7] py-8 border-t border-[#e5e5e1] mt-auto">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-16 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#444748]">
          <span>CURATOR VIDEO INTELLIGENCE PLATFORM — MCIR 2026</span>
          <div className="flex gap-6">
            <span className="hover:text-[#1a1c1b] cursor-pointer">Security Protocol</span>
            <span className="hover:text-[#1a1c1b] cursor-pointer">Archive Manifesto</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
