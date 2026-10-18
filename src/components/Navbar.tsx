'use client';

import React from 'react';
import { Sparkles, Shield, Cpu, History, PanelLeft } from 'lucide-react';
import { EngineType } from '@/types';

interface NavbarProps {
  engine: EngineType;
  setEngine: (engine: EngineType) => void;
  antiFluff: boolean;
  setAntiFluff: (val: boolean) => void;
  historyCount: number;
  onOpenHistory: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  engine,
  setEngine,
  antiFluff,
  setAntiFluff,
  historyCount,
  onOpenHistory,
  sidebarOpen = true,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#4E342E]/20 bg-[#FFF3E0]/90 backdrop-blur-xl">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              id="toggle-sidebar-rail"
              type="button"
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                sidebarOpen
                  ? 'bg-[#C62828] border-[#C62828] text-white shadow-sm shadow-[#C62828]/25'
                  : 'bg-white border-[#4E342E]/25 text-[#4E342E] hover:border-[#C62828]'
              }`}
              title={sidebarOpen ? 'Collapse Left Command Rail' : 'Expand Left Command Rail'}
            >
              <PanelLeft className="w-4 h-4" />
              <span className="hidden xl:inline text-[11px] font-bold">
                {sidebarOpen ? 'Rail Active' : 'Show Rail'}
              </span>
            </button>
          )}

          <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#C62828] to-[#4E342E] shadow-md shadow-[#C62828]/25 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB74D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-[#FFB74D]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1B0E07]">
                PromptBridge
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-[#FFB74D]/30 text-[#4E342E] border border-[#FFB74D]/60">
                v2.0
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#4E342E]/80 hidden md:block">
              Universal Autonomous Prompt Engineer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Anti-Fluff Toggle */}
          <button
            id="toggle-anti-fluff"
            type="button"
            onClick={() => setAntiFluff(!antiFluff)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 border shrink-0 ${
              antiFluff
                ? 'bg-[#C62828] border-[#C62828] text-white shadow-sm shadow-[#C62828]/30'
                : 'bg-white border-[#4E342E]/25 text-[#4E342E] hover:border-[#C62828]'
            }`}
            title="Bans AI clichés, filler preambles, and robotic sign-offs"
          >
            <Shield className={`w-3.5 h-3.5 ${antiFluff ? 'text-white' : 'text-[#4E342E]'}`} />
            <span className="hidden sm:inline">Anti-Fluff</span>
            <span className={`px-1 sm:px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold ${antiFluff ? 'bg-black/20 text-white' : 'bg-[#FFF3E0] text-[#4E342E]'}`}>
              {antiFluff ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Engine Selector */}
          <div className="flex items-center bg-white border border-[#4E342E]/20 rounded-lg p-0.5 shrink-0 shadow-sm">
            <button
              id="select-engine-gemini"
              type="button"
              onClick={() => setEngine('gemini')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                engine === 'gemini'
                  ? 'bg-[#C62828] text-white shadow-sm'
                  : 'text-[#4E342E] hover:text-[#C62828]'
              }`}
              title="Google Gemini Flash (Active Free Key)"
            >
              <Cpu className="w-3 h-3" />
              <span>Gemini</span>
            </button>
            <button
              id="select-engine-groq"
              type="button"
              onClick={() => setEngine('groq')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                engine === 'groq'
                  ? 'bg-[#C62828] text-white shadow-sm'
                  : 'text-[#4E342E] hover:text-[#C62828]'
              }`}
              title="Groq Llama-3.3-70B"
            >
              <Cpu className="w-3 h-3" />
              <span>Groq</span>
            </button>
          </div>

          {/* History Drawer Trigger */}
          <button
            id="open-history-btn"
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:border-[#C62828] transition-all shrink-0 shadow-sm"
            title="View prompt history and saved favorites"
          >
            <History className="w-3.5 h-3.5 text-[#C62828]" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex items-center justify-center px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#FFB74D] text-[#1B0E07] border border-[#4E342E]/30">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
