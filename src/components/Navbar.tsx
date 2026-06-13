import React from "react";
import { Play, Sparkles, BookOpen, Layers } from "lucide-react";

interface NavbarProps {
  currentScreen: string;
  setScreen: (screen: string) => void;
  onUploadClick: () => void;
}

export default function Navbar({ currentScreen, setScreen, onUploadClick }: NavbarProps) {
  return (
    <nav className="bg-[#f9f9f7] border-b border-[#e5e5e1] w-full h-16 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex justify-between items-center px-6 md:px-16 w-full max-w-[1440px] mx-auto h-full">
        {/* Brand Lockup */}
        <div className="flex items-center gap-12 h-full">
          <button 
            onClick={() => setScreen("landing")}
            className="font-display text-2xl font-semibold tracking-tighter text-[#1a1c1b] hover:opacity-80 transition-opacity cursor-pointer"
            id="brand-logo"
          >
            CURATOR
          </button>
          
          <div className="hidden md:flex h-full items-center gap-8">
            <button
              onClick={() => setScreen("dashboard")}
              className={`h-full flex items-center font-sans text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer ${
                currentScreen === "dashboard" 
                  ? "text-[#1a1c1b] border-b-2 border-[#1a1c1b] pt-1" 
                  : "text-[#444748] hover:text-[#1a1c1b]"
              }`}
              id="nav-dashboard"
            >
              Dashboard
            </button>
            <button
              onClick={() => setScreen("insights")}
              className={`h-full flex items-center font-sans text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer ${
                currentScreen === "insights" 
                  ? "text-[#1a1c1b] border-b-2 border-[#1a1c1b] pt-1" 
                  : "text-[#444748] hover:text-[#1a1c1b]"
              }`}
              id="nav-insights"
            >
              Insights
            </button>
            <button
              onClick={() => setScreen("archive")}
              className={`h-full flex items-center font-sans text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer ${
                currentScreen === "archive" 
                  ? "text-[#1a1c1b] border-b-2 border-[#1a1c1b] pt-1" 
                  : "text-[#444748] hover:text-[#1a1c1b]"
              }`}
              id="nav-archive"
            >
              Archive
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onUploadClick}
            className="bg-[#1a1c1b] text-[#f9f9f7] text-xs font-semibold uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-[#c47b5f] transition-all duration-300 cursor-pointer"
            id="nav-action-btn"
          >
            Upload Asset
          </button>
        </div>
      </div>
    </nav>
  );
}
