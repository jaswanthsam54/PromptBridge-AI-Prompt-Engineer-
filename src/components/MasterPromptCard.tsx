'use client';

import React, { useState } from 'react';
import { GenerateMasterPromptResponse, TargetLLM, FrameworkType } from '@/types';
import {
  Copy,
  Check,
  ExternalLink,
  Star,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Download,
  SplitSquareVertical,
} from 'lucide-react';

interface MasterPromptCardProps {
  result: GenerateMasterPromptResponse;
  initialQuality: number;
  selectedFramework: FrameworkType;
  targetLLM: TargetLLM;
  rawInput: string;
  onRetarget: (newTarget: TargetLLM) => void;
  onStartOver: () => void;
  isStarred: boolean;
  onToggleStar: () => void;
  onShowToast: (message: string) => void;
}

export const MasterPromptCard: React.FC<MasterPromptCardProps> = ({
  result,
  initialQuality,
  selectedFramework,
  targetLLM,
  rawInput,
  onRetarget,
  onStartOver,
  isStarred,
  onToggleStar,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(result.master_prompt);
  const [isEditing, setIsEditing] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedPrompt);
      setCopied(true);
      onShowToast('Master prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Could not access clipboard');
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([editedPrompt], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `master_prompt_${selectedFramework.toLowerCase()}_${targetLLM}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('Master prompt downloaded as .md!');
    } catch (e) {
      onShowToast('Download failed');
    }
  };

  const handleLaunch = async (url: string, platformName: string) => {
    try {
      await navigator.clipboard.writeText(editedPrompt);
      onShowToast(`Prompt copied! Opening ${platformName}...`);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Highlight placeholders like [PASTE YOUR CODE HERE]
  const renderFormattedPrompt = (text: string) => {
    const parts = text.split(/(\[[A-Z0-9_\s/-]+\])/g);
    return parts.map((part, i) => {
      if (/^\[[A-Z0-9_\s/-]+\]$/.test(part) && (part.includes('PASTE') || part.includes('HERE') || part.includes('INSERT'))) {
        return (
          <span key={i} className="variable-placeholder">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Card: Quality Upgrade & Badges */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-[#4E342E]/25 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#4E342E]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#C62828]" />
              <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#C62828]">
                Master Prompt Synthesized
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-[#4E342E]">
              {result.target_model_recommendation || 'Engineered for high-precision model execution.'}
            </p>
          </div>

          {/* Quality Upgrade Meter */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-[#FFF3E0] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#4E342E]/20 self-start md:self-center shrink-0 shadow-2xs">
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#4E342E]/80">Prompt Quality</div>
              <div className="text-[11px] sm:text-xs text-[#C62828] font-bold flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+{result.quality_score_final - initialQuality}% Signal Boost</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm">
              <span className="text-[#4E342E]/70">{initialQuality}%</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#4E342E]/50" />
              <span className="text-[#C62828] text-sm sm:text-base font-extrabold">{result.quality_score_final}%</span>
            </div>
          </div>
        </div>

        {/* Upgrades Applied Badges */}
        <div className="pt-3">
          <div className="text-[11px] font-bold text-[#4E342E] uppercase tracking-wider mb-2">
            Engineering Upgrades Applied:
          </div>
          <div className="flex flex-wrap gap-2">
            {result.upgrades_applied.map((upgrade, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FFB74D]/25 border border-[#FFB74D]/60 text-[#1B0E07]"
              >
                <Sparkles className="w-3 h-3 text-[#C62828]" />
                <span>{upgrade}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Placeholder Warning if context blocks detected */}
        {result.has_placeholders && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FFB74D]/25 border border-[#FFB74D]/60 text-[#1B0E07] text-xs font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#C62828]" />
            <span>
              Dynamic placeholder detected: replace highlighted blocks with your specific code or files before launching!
            </span>
          </div>
        )}
      </div>

      {/* Target Syntax Re-tuner Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1B0E07]">
          <span>Target LLM Syntax:</span>
          <div className="inline-flex p-1 bg-white rounded-lg border border-[#4E342E]/25 shadow-2xs">
            {(['universal', 'claude', 'chatgpt', 'deepseek'] as TargetLLM[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onRetarget(mode)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize transition-all ${
                  targetLLM === mode
                    ? 'bg-[#C62828] text-white shadow-xs'
                    : 'text-[#4E342E] hover:text-[#C62828]'
                }`}
              >
                {mode === 'chatgpt' ? 'ChatGPT' : mode === 'deepseek' ? 'DeepSeek' : mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
              comparisonMode
                ? 'bg-[#C62828] border-[#C62828] text-white'
                : 'bg-white border-[#4E342E]/25 text-[#4E342E] hover:border-[#C62828]'
            }`}
            title="Toggle side-by-side comparison of raw input vs master prompt"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>{comparisonMode ? 'Single View' : 'Side-by-Side'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:border-[#C62828] font-semibold"
            title="Download prompt as .md file"
          >
            <Download className="w-3.5 h-3.5 text-[#C62828]" />
            <span>.md</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:border-[#C62828] font-semibold"
          >
            {isEditing ? 'Preview Mode' : 'Edit'}
          </button>
          <button
            type="button"
            onClick={onToggleStar}
            className={`p-1.5 rounded-lg border transition-all ${
              isStarred
                ? 'bg-[#FFB74D] border-[#FFB74D] text-[#1B0E07]'
                : 'bg-white border-[#4E342E]/25 text-[#4E342E] hover:border-[#C62828]'
            }`}
            title="Star prompt to save in Favorites"
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-[#1B0E07]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comparison View OR Standard View */}
      {comparisonMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Raw Input */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-[#4E342E]/25 flex flex-col shadow-sm">
            <div className="px-4 py-2.5 bg-[#FFF3E0] border-b border-[#4E342E]/20 flex items-center justify-between text-xs">
              <span className="font-bold text-[#1B0E07]">Raw Input (Before)</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#FFB74D]/40 text-[#4E342E] font-mono font-bold">
                {initialQuality}% Quality
              </span>
            </div>
            <div className="p-4 text-xs font-mono text-[#1B0E07] whitespace-pre-wrap leading-relaxed flex-1 bg-white/70">
              {rawInput}
            </div>
          </div>

          {/* Right: Engineered Master Prompt */}
          <div className="glass-panel rounded-2xl overflow-hidden border-2 border-[#C62828]/40 flex flex-col shadow-md">
            <div className="px-4 py-2.5 bg-[#C62828]/10 border-b border-[#C62828]/30 flex items-center justify-between text-xs">
              <span className="font-bold text-[#C62828]">Master Prompt (Engineered)</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#C62828] text-white font-mono font-bold">
                {result.quality_score_final}% Quality
              </span>
            </div>
            <div className="p-4 text-xs font-mono text-[#1B0E07] whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto flex-1 bg-white/90">
              {renderFormattedPrompt(editedPrompt)}
            </div>
          </div>
        </div>
      ) : (
        /* Master Prompt Output Box */
        <div className="relative glass-panel rounded-2xl overflow-hidden border border-[#4E342E]/25 shadow-md">
          <div className="flex items-center justify-between px-4 py-3 bg-[#FFF3E0] border-b border-[#4E342E]/20 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#C62828]" />
              <span className="font-mono font-bold text-[#1B0E07]">
                master_prompt.{targetLLM === 'claude' ? 'xml' : 'md'}
              </span>
            </div>
            <button
              id="copy-master-prompt-header-btn"
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C62828] text-white hover:bg-[#B71C1C] transition-all font-bold shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Master Prompt'}</span>
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              rows={16}
              className="w-full p-4 font-mono text-xs text-[#1B0E07] bg-white focus:outline-none resize-y"
            />
          ) : (
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm text-[#1B0E07] bg-white/95 whitespace-pre-wrap leading-relaxed select-text overflow-x-auto max-h-[550px] overflow-y-auto">
              {renderFormattedPrompt(editedPrompt)}
            </div>
          )}
        </div>
      )}

      {/* Launchers & Action Bar */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#4E342E]">
          1-Click Launchers (Auto-copies prompt to clipboard + opens destination):
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            id="launch-chatgpt-btn"
            type="button"
            onClick={() => handleLaunch('https://chatgpt.com', 'ChatGPT')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:border-[#C62828] hover:text-[#C62828] transition-all font-bold text-xs shadow-xs"
          >
            <span>Open in ChatGPT</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C62828]" />
          </button>

          <button
            id="launch-claude-btn"
            type="button"
            onClick={() => handleLaunch('https://claude.ai/new', 'Claude')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:border-[#C62828] hover:text-[#C62828] transition-all font-bold text-xs shadow-xs"
          >
            <span>Open in Claude</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C62828]" />
          </button>

          <button
            id="launch-gemini-btn"
            type="button"
            onClick={() => handleLaunch('https://gemini.google.com/app', 'Gemini')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:border-[#C62828] hover:text-[#C62828] transition-all font-bold text-xs shadow-xs"
          >
            <span>Open in Gemini</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C62828]" />
          </button>

          <button
            id="launch-deepseek-btn"
            type="button"
            onClick={() => handleLaunch('https://chat.deepseek.com', 'DeepSeek')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:border-[#C62828] hover:text-[#C62828] transition-all font-bold text-xs shadow-xs"
          >
            <span>Open in DeepSeek</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C62828]" />
          </button>
        </div>

        {/* Start Over Button */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onStartOver}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C62828] text-white hover:bg-[#B71C1C] transition-all shadow-md shadow-[#C62828]/25"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Engineer Another Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
