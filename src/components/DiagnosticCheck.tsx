'use client';

import React, { useState } from 'react';
import { AnalyzeAndAskResponse } from '@/types';
import { Sparkles, ArrowLeft, Zap, CheckCircle2, Cpu, HelpCircle, Layers } from 'lucide-react';

interface DiagnosticCheckProps {
  diagnostic: AnalyzeAndAskResponse;
  rawInput: string;
  onSynthesize: (answers: Record<string, string[]>) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const DiagnosticCheck: React.FC<DiagnosticCheckProps> = ({
  diagnostic,
  rawInput,
  onSynthesize,
  onBack,
  isLoading,
}) => {
  // Store selected options per question id: { q1: ['Option A', 'Option B'] }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    // Pre-select the first option as high-probability smart default
    diagnostic.clarifying_questions.forEach((q) => {
      if (q.options.length > 0) {
        initial[q.id] = [q.options[0]];
      } else {
        initial[q.id] = [];
      }
    });
    return initial;
  });

  // Store custom write-ins per question id
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const toggleOption = (questionId: string, option: string, allowMultiple: boolean) => {
    setSelectedOptions((prev) => {
      const current = prev[questionId] || [];
      if (allowMultiple) {
        if (current.includes(option)) {
          return { ...prev, [questionId]: current.filter((item) => item !== option) };
        } else {
          return { ...prev, [questionId]: [...current, option] };
        }
      } else {
        // Single select
        return { ...prev, [questionId]: [option] };
      }
    });
  };

  const handleCustomInputChange = (questionId: string, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSkipToDefaults = () => {
    // Select first option for every question
    const defaults: Record<string, string[]> = {};
    diagnostic.clarifying_questions.forEach((q) => {
      defaults[q.id] = q.options.length > 0 ? [q.options[0]] : ['Standard Default'];
    });
    onSynthesize(defaults);
  };

  const handleProceed = () => {
    // Merge selected pills with custom write-in inputs
    const finalAnswers: Record<string, string[]> = {};
    diagnostic.clarifying_questions.forEach((q) => {
      const pills = selectedOptions[q.id] || [];
      const custom = customInputs[q.id]?.trim();
      const combined = [...pills];
      if (custom && !combined.includes(custom)) {
        combined.push(custom);
      }
      finalAnswers[q.id] = combined.length > 0 ? combined : [q.options[0] || 'Default'];
    });
    onSynthesize(finalAnswers);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Diagnosis & Initial Quality Score */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-[#4E342E]/25 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#4E342E]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#C62828] animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#C62828]">
                Diagnostic Ambiguity Check
              </h2>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#1B0E07]">
              {diagnostic.detected_intent}
            </p>
          </div>

          {/* Quality Score Meter */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-[#FFF3E0] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-[#4E342E]/20 self-start sm:self-center shrink-0 shadow-2xs">
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#4E342E]/80">Initial Score</div>
              <div className="text-[11px] sm:text-xs text-[#C62828] font-bold">Needs Refinement</div>
            </div>
            <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-[#FFB74D]/40 border border-[#FFB74D] text-[#1B0E07] font-mono font-extrabold text-xs sm:text-sm shadow-xs">
              {diagnostic.quality_score_initial}%
            </div>
          </div>
        </div>

        {/* Framework & Reasoning Routing Metadata */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 text-[11px] sm:text-xs text-[#4E342E]">
          <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-white border border-[#4E342E]/20 text-[#1B0E07] font-mono font-semibold shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#C62828]" />
            Framework: <strong className="text-[#C62828] font-bold">{diagnostic.selected_framework}</strong>
          </span>
          {diagnostic.reasoning_addon !== 'NONE' && (
            <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-[#FFB74D]/25 border border-[#FFB74D]/60 text-[#1B0E07] font-mono font-semibold shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-[#C62828]" />
              Reasoning: <strong>{diagnostic.reasoning_addon}</strong>
            </span>
          )}
          <span className="text-[10px] sm:text-[11px] text-[#4E342E]/80 ml-auto hidden md:inline font-medium">
            Resolving critical 80% ambiguity before synthesis
          </span>
        </div>
      </div>

      {/* Clarifying Questions List */}
      <div className="space-y-4">
        {diagnostic.clarifying_questions.map((q, idx) => {
          const currentSelected = selectedOptions[q.id] || [];
          return (
            <div
              key={q.id}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-[#4E342E]/20 hover:border-[#C62828]/40 transition-all duration-200 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#C62828]/10 border border-[#C62828]/30 text-[#C62828] text-xs font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-[#1B0E07]">{q.question}</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#4E342E] border border-[#4E342E]/20 shrink-0">
                  {q.allow_multiple ? 'Multi-select' : 'Single-select'}
                </span>
              </div>

              {/* Rapid-Tap Option Pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {q.options.map((opt) => {
                  const isChecked = currentSelected.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleOption(q.id, opt, q.allow_multiple)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border cursor-pointer ${
                        isChecked
                          ? 'bg-[#C62828] border-[#C62828] text-white shadow-xs'
                          : 'bg-white border-[#4E342E]/20 text-[#4E342E] hover:text-[#1B0E07] hover:border-[#C62828]/40 hover:bg-[#FFF3E0]/40'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 transition-colors ${
                          isChecked ? 'text-white' : 'text-[#4E342E]/40'
                        }`}
                      />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Custom Input */}
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Or write custom nuance / requirement..."
                  value={customInputs[q.id] || ''}
                  onChange={(e) => handleCustomInputChange(q.id, e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-[#1B0E07] placeholder-[#4E342E]/50 border border-[#4E342E]/20 focus:border-[#C62828]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#4E342E] hover:text-[#C62828] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Initial Input</span>
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Skip to Defaults Button */}
          <button
            type="button"
            onClick={handleSkipToDefaults}
            disabled={isLoading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:text-[#C62828] hover:border-[#C62828] transition-all cursor-pointer shadow-2xs"
            title="Auto-select highest-probability answers and synthesize instantly"
          >
            <Zap className="w-3.5 h-3.5 text-[#FFB74D] fill-[#FFB74D]" />
            <span>⚡ Skip to Best Defaults</span>
          </button>

          {/* Synthesize Master Prompt Button */}
          <button
            type="button"
            onClick={handleProceed}
            disabled={isLoading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-md shadow-[#C62828]/20 hover:shadow-[#C62828]/35 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Master Prompt...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Master Prompt ➔</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
