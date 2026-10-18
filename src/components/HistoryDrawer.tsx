'use client';

import React, { useState } from 'react';
import { PromptHistoryItem } from '@/types';
import {
  X,
  Star,
  Trash2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptHistoryItem[];
  onToggleStar: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onSelectHistoryItem: (item: PromptHistoryItem) => void;
  onShowToast: (message: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onToggleStar,
  onDeleteItem,
  onClearAll,
  onSelectHistoryItem,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'starred'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (activeTab === 'starred' && !item.isStarred) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.rawInput.toLowerCase().includes(q) ||
        item.masterPrompt.toLowerCase().includes(q) ||
        item.framework.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyPrompt = async (item: PromptHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.masterPrompt);
      setCopiedId(item.id);
      onShowToast('Master prompt copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Could not access clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1B0E07]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full sm:max-w-md h-full bg-[#FFF3E0] border-l border-[#4E342E]/25 p-4 sm:p-5 flex flex-col z-10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#4E342E]/15">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#C62828]" />
            <h2 className="text-base font-extrabold text-[#1B0E07]">Prompt History</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#4E342E]/20 text-[#4E342E] font-mono font-bold">
              {history.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#4E342E] hover:text-[#C62828] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="py-3 space-y-3">
          <div className="flex gap-2 p-1 bg-white rounded-xl border border-[#4E342E]/20 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#C62828] text-white shadow-xs'
                  : 'text-[#4E342E] hover:text-[#C62828]'
              }`}
            >
              All Prompts ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('starred')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'starred'
                  ? 'bg-[#C62828] text-white shadow-xs'
                  : 'text-[#4E342E] hover:text-[#C62828]'
              }`}
            >
              <Star className="w-3 h-3 fill-[#FFB74D] text-[#FFB74D]" />
              <span>Starred ({history.filter((h) => h.isStarred).length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#4E342E]/60" />
            <input
              type="text"
              placeholder="Search past prompts or frameworks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#4E342E]/25 text-xs text-[#1B0E07] placeholder-[#4E342E]/50 focus:outline-none focus:border-[#C62828] shadow-2xs"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-[#4E342E] text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-[#C62828]/50" />
              <p>No prompts found in history.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group p-3.5 rounded-xl bg-white border border-[#4E342E]/20 hover:border-[#C62828]/60 transition-all space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#FFB74D]/25 border border-[#FFB74D]/60 text-[#1B0E07]">
                      {item.framework}
                    </span>
                    <span className="px-1.5 py-0.5 rounded uppercase font-mono text-[10px] bg-[#FFF3E0] text-[#4E342E] border border-[#4E342E]/20">
                      {item.targetLLM}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#C62828] font-mono font-bold">
                      {item.qualityFinal}%
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleStar(item.id)}
                      className={`p-1 rounded text-[#4E342E] hover:text-[#C62828] transition-colors ${
                        item.isStarred ? 'text-[#FFB74D]' : ''
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isStarred ? 'fill-[#FFB74D] text-[#FFB74D]' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 rounded text-[#4E342E]/60 hover:text-[#C62828] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Raw Input snippet */}
                <p className="text-xs text-[#1B0E07] line-clamp-2 font-semibold">
                  {item.rawInput}
                </p>

                {/* Master prompt preview */}
                <p className="text-[11px] text-[#4E342E] line-clamp-2 font-mono bg-[#FFF3E0]/70 p-2 rounded-lg border border-[#4E342E]/15">
                  {item.masterPrompt}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[10px] text-[#4E342E]/70 font-medium">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(item)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FFF3E0] hover:bg-white text-[#1B0E07] border border-[#4E342E]/20 transition-colors text-[11px] font-semibold"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-[#C62828]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#C62828]" />
                      )}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#C62828] text-white hover:bg-[#B71C1C] transition-colors text-[11px] font-bold shadow-2xs"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-[#4E342E]/15 flex justify-end">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-[#C62828] hover:underline font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
