'use client';

import React from 'react';
import { TargetLLM } from '@/types';
import { Sparkles, Terminal, Code2, Bot } from 'lucide-react';

interface TargetSelectorProps {
  selected: TargetLLM;
  onSelect: (target: TargetLLM) => void;
}

const TARGETS: {
  id: TargetLLM;
  label: string;
  badge: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    id: 'universal',
    label: 'Universal',
    badge: 'Any LLM',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    desc: 'Clean markdown hierarchy compatible with all models',
  },
  {
    id: 'claude',
    label: 'Claude',
    badge: 'XML Tags',
    icon: <Code2 className="w-3.5 h-3.5" />,
    desc: 'Strict XML tags (<role>, <context>, <constraints>)',
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    badge: 'Strict Headers',
    icon: <Bot className="w-3.5 h-3.5" />,
    desc: 'Structured H2 headers with negative guardrails',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    badge: 'Direct Reasoning',
    icon: <Terminal className="w-3.5 h-3.5" />,
    desc: 'Zero-bloat goal framing for DeepSeek reasoning',
  },
];

export const TargetSelector: React.FC<TargetSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full">
      {/* Header with stacked title and subtitle to prevent horizontal text collision */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-bold text-[#1B0E07] uppercase tracking-wider">
            Target LLM Syntactic Tuning
          </label>
          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#FFB74D]/30 text-[#1B0E07] shrink-0 border border-[#FFB74D]/50">
            Active: {TARGETS.find((t) => t.id === selected)?.label}
          </span>
        </div>
        <p className="text-[11px] text-[#4E342E]/85 leading-snug">
          Synthesizes optimal syntax for model architecture
        </p>
      </div>

      {/* Grid: 1 column in sidebar / mobile, 2 columns on tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {TARGETS.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              id={`target-selector-${t.id}`}
              type="button"
              onClick={() => onSelect(t.id)}
              className={`w-full flex flex-col text-left p-3 rounded-xl transition-all duration-200 border cursor-pointer min-w-0 ${
                isSelected
                  ? 'bg-white border-[#C62828] shadow-md shadow-[#C62828]/15 ring-2 ring-[#C62828]/25'
                  : 'bg-white/85 border-[#4E342E]/20 text-[#4E342E] hover:border-[#C62828]/50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5 gap-2 min-w-0">
                <span
                  className={`flex items-center gap-2 text-xs sm:text-sm font-bold min-w-0 ${
                    isSelected ? 'text-[#C62828]' : 'text-[#1B0E07]'
                  }`}
                >
                  <span
                    className={`p-1 rounded-md shrink-0 ${
                      isSelected
                        ? 'bg-[#C62828] text-white'
                        : 'bg-[#FFF3E0] text-[#C62828] border border-[#4E342E]/10'
                    }`}
                  >
                    {t.icon}
                  </span>
                  <span className="truncate">{t.label}</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shrink-0 border ${
                    isSelected
                      ? 'bg-[#FFB74D] text-[#1B0E07] border-[#FFB74D]'
                      : 'bg-[#FFF3E0] text-[#4E342E] border-[#4E342E]/20'
                  }`}
                >
                  {t.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#4E342E]/80 leading-relaxed font-normal">
                {t.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
