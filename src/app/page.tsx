'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { TargetSelector } from '@/components/TargetSelector';
import { InspirationBadges } from '@/components/InspirationBadges';
import { MasterPromptCard } from '@/components/MasterPromptCard';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import {
  TargetLLM,
  EngineType,
  AnalyzeAndAskResponse,
  GenerateMasterPromptResponse,
  PromptHistoryItem,
  FrameworkType,
  UnifiedMasterPromptResponse,
} from '@/types';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle2,
  Shield,
  Zap,
  History,
  BookOpen,
  Flame,
  Star,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

const PROMPT_PRESETS = [
  {
    category: 'Full-Stack',
    icon: '⚡',
    title: 'Next.js 15 + Stripe SaaS',
    prompt: 'Build a production-ready Next.js 15 SaaS with Supabase authentication, Stripe subscription billing, and Tailwind CSS. Detail the database schema, edge API routes, and webhook verification.',
  },
  {
    category: 'Database',
    icon: '🗄️',
    title: 'Zero-Downtime SQL Migration',
    prompt: 'Write a zero-downtime PostgreSQL migration for adding a composite index and new JSONB column to a 50-million-row users table without locking reads or writes.',
  },
  {
    category: 'System Design',
    icon: '🏗️',
    title: 'High-Concurrency Event Bus',
    prompt: 'Design an event-driven microservices architecture using Kafka and Redis to handle 50,000 webhook events per second with idempotency and dead-letter queues.',
  },
  {
    category: 'Marketing',
    icon: '🎯',
    title: 'High-Converting Cold Pitch',
    prompt: 'Write a 3-part cold email sequence targeting B2B SaaS CTOs to pitch our developer tooling API with a 30%+ response rate without sounding salesy.',
  },
  {
    category: 'Academic',
    icon: '🔬',
    title: 'Multi-Agent AI Review',
    prompt: 'Synthesize the latest research on Multi-Agent Reinforcement Learning and compare centralized training with decentralized execution paradigms.',
  },
  {
    category: 'Debug',
    icon: '🐞',
    title: 'Memory Leak & Heap Diagnosis',
    prompt: 'Analyze this memory leak in a Node.js microservice experiencing heap exhaustion under sustained WebSocket connections.',
  },
];

const FRAMEWORK_QUICK_CARDS = [
  { name: '11-POINT', tag: 'Universal', desc: '11-part rigorous structure with negative constraints & edge cases' },
  { name: 'CO-STAR', tag: 'Strategy', desc: 'Context, Objective, Style, Tone, Audience, Response' },
  { name: 'RISEN', tag: 'Execution', desc: 'Role, Input, Steps, Expectation, Narrowing' },
  { name: 'RTF', tag: 'Direct', desc: 'Role, Task, Format for concise developer output' },
];

export default function Home() {
  // Config state
  const [engine, setEngine] = useState<EngineType>('gemini');
  const [targetLLM, setTargetLLM] = useState<TargetLLM>('universal');
  const [antiFluff, setAntiFluff] = useState<boolean>(true);

  // Phase & Navigation state
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
  const [rawInput, setRawInput] = useState<string>('');
  const [diagnostic, setDiagnostic] = useState<AnalyzeAndAskResponse | null>(null);
  const [masterResult, setMasterResult] = useState<GenerateMasterPromptResponse | null>(null);
  const [activeAnswers, setActiveAnswers] = useState<Record<string, string[]>>({});

  // Loading & error state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Command Center Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // History state
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('promptbridge_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (items: PromptHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem('promptbridge_history', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Initialize Web Speech API for voice dictation
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      showToast('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        showToast('Listening... Speak now');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setRawInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        showToast(`Mic error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition init failed:', err);
      setIsRecording(false);
      showToast('Could not access microphone.');
    }
  };

  // Single Master Request Flow: Directly engineer master prompt in 1 API call
  const handleEngineerMasterPrompt = async (overrideTarget?: TargetLLM) => {
    if (!rawInput.trim()) {
      setErrorMessage('Please enter a query, broken sentence, or voice transcript first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const targetToUse = overrideTarget || targetLLM;

    try {
      const res = await fetch('/api/engineer-master-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: rawInput.trim(),
          antiFluff,
          targetLLM: targetToUse,
          engine,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data: UnifiedMasterPromptResponse = await res.json();

      setMasterResult({
        master_prompt: data.master_prompt,
        upgrades_applied: data.upgrades_applied,
        has_placeholders: data.has_placeholders,
        quality_score_final: data.quality_score_final,
        target_model_recommendation: data.target_model_recommendation,
      });

      setDiagnostic({
        detected_intent: data.detected_intent,
        selected_framework: data.selected_framework,
        reasoning_addon: data.reasoning_addon,
        quality_score_initial: data.quality_score_initial,
        clarifying_questions: [],
      });

      setCurrentPhase(3);

      // Save to local storage history
      const promptId = `pb-${Date.now()}`;
      setCurrentPromptId(promptId);

      const newItem: PromptHistoryItem = {
        id: promptId,
        timestamp: Date.now(),
        rawInput: rawInput.trim(),
        masterPrompt: data.master_prompt,
        framework: data.selected_framework,
        targetLLM: targetToUse,
        qualityInitial: data.quality_score_initial,
        qualityFinal: data.quality_score_final,
        isStarred: false,
      };

      saveHistory([newItem, ...history.slice(0, 49)]);
    } catch (err: any) {
      console.error('Master prompt engineering failed:', err);
      setErrorMessage(err.message || 'Something went wrong while generating the master prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-target LLM syntax in Phase 3
  const handleRetarget = (newTarget: TargetLLM) => {
    setTargetLLM(newTarget);
    handleEngineerMasterPrompt(newTarget);
  };

  const handleStartOver = () => {
    setRawInput('');
    setDiagnostic(null);
    setMasterResult(null);
    setActiveAnswers({});
    setCurrentPhase(1);
    setErrorMessage(null);
  };

  const handleToggleStar = (id: string) => {
    const updated = history.map((item) =>
      item.id === id ? { ...item, isStarred: !item.isStarred } : item
    );
    saveHistory(updated);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your prompt history?')) {
      saveHistory([]);
    }
  };

  const handleSelectHistoryItem = (item: PromptHistoryItem) => {
    setRawInput(item.rawInput);
    setTargetLLM(item.targetLLM);
    setMasterResult({
      master_prompt: item.masterPrompt,
      upgrades_applied: [
        `Framework: ${item.framework}`,
        `Target: ${item.targetLLM.toUpperCase()}`,
        'Restored from History',
      ],
      has_placeholders: /\[PASTE\s+[^\]]+\]/i.test(item.masterPrompt),
      quality_score_final: item.qualityFinal,
      target_model_recommendation: `Saved item optimized for ${item.targetLLM.toUpperCase()}`,
    });
    setDiagnostic({
      detected_intent: item.rawInput,
      selected_framework: item.framework as FrameworkType,
      reasoning_addon: 'NONE',
      quality_score_initial: item.qualityInitial,
      clarifying_questions: [],
    });
    setCurrentPhase(3);
  };

  const isCurrentPromptStarred =
    Boolean(currentPromptId && history.find((h) => h.id === currentPromptId)?.isStarred);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navigation */}
      <Navbar
        engine={engine}
        setEngine={setEngine}
        antiFluff={antiFluff}
        setAntiFluff={setAntiFluff}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main 3-Column Command Center Workspace */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Error:</span> {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3-Column Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* COLUMN 1 (Left 3 cols): Command Rail (Starters, Saved Library, Frameworks) */}
          {sidebarOpen && (
            <aside className="lg:col-span-3 space-y-4 animate-in fade-in slide-in-from-left duration-200">
              {/* Quick Starters & Presets */}
              <div className="glass-panel-elevated rounded-2xl p-4 border border-[#4E342E]/20 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#4E342E]/10">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#C62828]" />
                    <h2 className="text-xs font-bold text-[#1B0E07] uppercase tracking-wider">
                      Quick Starters
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFB74D]/30 text-[#1B0E07] border border-[#FFB74D]/60">
                    Templates
                  </span>
                </div>
                <p className="text-[11px] text-[#4E342E]/80 leading-relaxed font-medium">
                  Click any template to populate the central workbench:
                </p>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {PROMPT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRawInput(preset.prompt);
                        if (currentPhase === 3) setCurrentPhase(1);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-white/95 border border-[#4E342E]/15 hover:border-[#C62828] hover:bg-white transition-all group flex items-start gap-2 shadow-2xs"
                    >
                      <span className="text-sm shrink-0 mt-0.5">{preset.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#1B0E07] group-hover:text-[#C62828] transition-colors truncate">
                          {preset.title}
                        </div>
                        <div className="text-[10px] text-[#4E342E]/70 line-clamp-1">
                          {preset.category}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#4E342E]/40 group-hover:text-[#C62828] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent & Starred Prompts Rail */}
              <div className="glass-panel rounded-2xl p-4 border border-[#4E342E]/20 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#4E342E]/10">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#C62828]" />
                    <h2 className="text-xs font-bold text-[#1B0E07] uppercase tracking-wider">
                      Saved Library
                    </h2>
                  </div>
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(true)}
                      className="text-[11px] text-[#C62828] hover:underline font-bold"
                    >
                      View All ({history.length})
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-4 text-[#4E342E]/70 text-xs">
                    <p className="font-medium">No prompts generated yet.</p>
                    <p className="text-[10px] mt-1 text-[#4E342E]/60">Your master prompts are stored locally in private storage.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {history.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#4E342E]/15 hover:border-[#C62828] transition-all flex items-center justify-between gap-2 shadow-2xs group"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectHistoryItem(item)}
                          className="flex-1 text-left min-w-0"
                          title="Click to restore prompt"
                        >
                          <p className="text-xs font-medium text-[#1B0E07] truncate group-hover:text-[#C62828] transition-colors">
                            {item.rawInput}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#4E342E]/70">
                            <span className="font-mono font-bold text-[#C62828]">{item.framework}</span>
                            <span>•</span>
                            <span className="font-bold text-[#4E342E]">{item.targetLLM.toUpperCase()}</span>
                          </div>
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFB74D]/30 text-[#1B0E07]">
                            {item.qualityFinal}%
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStar(item.id)}
                            className="p-1 text-[#4E342E]/50 hover:text-[#FFB74D] transition-colors"
                            title={item.isStarred ? 'Unstar' : 'Star'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                item.isStarred ? 'fill-[#FFB74D] text-[#FFB74D]' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Framework Reference Engine */}
              <div className="glass-panel rounded-2xl p-4 border border-[#4E342E]/20 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C62828]" />
                  <h2 className="text-xs font-bold text-[#1B0E07] uppercase tracking-wider">
                    Framework Engine
                  </h2>
                </div>
                <p className="text-[11px] text-[#4E342E]/80 font-medium">
                  Autonomous routing according to prompt complexity:
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {FRAMEWORK_QUICK_CARDS.map((f, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-white/80 border border-[#4E342E]/15 text-left"
                      title={f.desc}
                    >
                      <div className="text-[11px] font-extrabold text-[#C62828]">{f.name}</div>
                      <div className="text-[9px] text-[#4E342E] truncate font-medium">{f.tag}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* COLUMN 2 (Center 6 or 9 cols): Main Workbench / Master Prompt */}
          <div className={`${sidebarOpen ? 'lg:col-span-6' : 'lg:col-span-9'} space-y-5 transition-all duration-200`}>
            {/* If in Phase 1: Human Input & Engineering Workbench */}
            {currentPhase === 1 ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Hero Heading */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB74D]/30 border border-[#FFB74D]/70 text-[#1B0E07] text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#C62828]" />
                    <span>Ask First, Engineer Second</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#1B0E07]">
                    Universal AI Prompt Engineer
                  </h1>
                  <p className="text-xs sm:text-sm text-[#4E342E] font-medium leading-relaxed">
                    Paste raw one-liners, slang, broken Hinglish/Telugish, or speak your thoughts. 
                    PromptBridge diagnoses ambiguity and constructs a mathematically optimal master prompt for any LLM in 1 pass.
                  </p>
                </div>

                {/* Input Workbench Card */}
                <div className="glass-panel-elevated rounded-2xl p-4 sm:p-6 border border-[#4E342E]/25 shadow-md relative">
                  <div className="relative">
                    <textarea
                      id="raw-prompt-input"
                      rows={6}
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleEngineerMasterPrompt();
                        }
                      }}
                      placeholder="Tell me what you want to achieve... (e.g. 'bhai ek nextjs app banana hai stripe ke saath' or 'write a postgres migration for composite index')"
                      className="w-full bg-transparent text-[#1B0E07] placeholder-[#4E342E]/60 text-sm sm:text-base focus:outline-none resize-none leading-relaxed font-medium"
                    />

                    {/* Microphone Pulse indicator */}
                    {isRecording && (
                      <div className="absolute top-2 right-2 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C62828]/20 border border-[#C62828]/50 text-[#C62828] text-xs font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#C62828] animate-ping" />
                        <span>Listening...</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Row inside Input Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#4E342E]/15 mt-2">
                    <div className="flex items-center gap-2.5">
                      {/* Voice Mic Button */}
                      <button
                        id="mic-dictation-btn"
                        type="button"
                        onClick={toggleRecording}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isRecording
                            ? 'bg-[#C62828] text-white pulse-recording'
                            : 'bg-white border border-[#4E342E]/25 text-[#1B0E07] hover:border-[#C62828]'
                        }`}
                        title="Dictate prompt via microphone (Free Web Speech API)"
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#C62828]" />}
                        <span>{isRecording ? 'Stop Mic' : 'Voice Dictation'}</span>
                      </button>

                      <span className="text-[11px] text-[#4E342E]/80 hidden sm:inline font-medium">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#4E342E]/20 text-[#1B0E07] font-mono">Enter ↵</kbd>
                      </span>

                      {rawInput.trim().length > 0 && (
                        <span className="text-[10px] text-[#4E342E]/70 font-mono hidden md:inline">
                          {rawInput.trim().length} chars • {rawInput.trim().split(/\s+/).length} words
                        </span>
                      )}
                    </div>

                    {/* Primary Action Button */}
                    <button
                      id="diagnose-prompt-btn"
                      type="button"
                      onClick={() => handleEngineerMasterPrompt()}
                      disabled={isLoading || !rawInput.trim()}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#C62828] text-white hover:bg-[#B71C1C] shadow-md shadow-[#C62828]/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Engineering Master Prompt...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#FFB74D]" />
                          <span>Engineer Master Prompt</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Inspiration Badges */}
                <InspirationBadges
                  onSelect={(val) => {
                    setRawInput(val);
                  }}
                />
              </div>
            ) : (
              /* If in Phase 3: Master Prompt Card View */
              masterResult && diagnostic && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={handleStartOver}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C62828] hover:underline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Back to Prompt Workbench</span>
                    </button>
                    <span className="text-xs font-mono font-bold text-[#4E342E]">
                      Target: {targetLLM.toUpperCase()}
                    </span>
                  </div>

                  <MasterPromptCard
                    result={masterResult}
                    initialQuality={diagnostic.quality_score_initial}
                    selectedFramework={diagnostic.selected_framework}
                    targetLLM={targetLLM}
                    rawInput={rawInput}
                    onRetarget={handleRetarget}
                    onStartOver={handleStartOver}
                    isStarred={isCurrentPromptStarred}
                    onToggleStar={() => currentPromptId && handleToggleStar(currentPromptId)}
                    onShowToast={showToast}
                  />
                </div>
              )
            )}
          </div>

          {/* COLUMN 3 (Right 3 cols): AI Tuning Cockpit & Live Optimization Metrics */}
          <div className="lg:col-span-3 space-y-4">
            {/* Target LLM Syntactic Tuning Selector */}
            <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-[#4E342E]/25 shadow-xs">
              <TargetSelector
                selected={targetLLM}
                onSelect={(newTarget) => {
                  setTargetLLM(newTarget);
                  if (currentPhase === 3) {
                    handleRetarget(newTarget);
                  }
                }}
              />
            </div>

            {/* Anti-Fluff Negative Shield */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[#4E342E]/20 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C62828]" />
                  <h3 className="text-xs font-bold text-[#1B0E07] uppercase tracking-wider">
                    Anti-Fluff Shield
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${antiFluff ? 'bg-[#C62828] text-white' : 'bg-gray-300 text-gray-700'}`}>
                  {antiFluff ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <p className="text-xs text-[#4E342E] leading-relaxed font-medium">
                Strictly bans robotic preambles (*"Certainly!"*, *"Here is..."*), corporate fluff (*delve*, *testament*, *tapestry*), and lazy code truncations.
              </p>
            </div>

            {/* 1-Pass Architecture Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[#4E342E]/20 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C62828]" />
                <h3 className="text-xs font-bold text-[#1B0E07] uppercase tracking-wider">
                  Instant 1-Pass Engine
                </h3>
              </div>
              <p className="text-xs text-[#4E342E] leading-relaxed font-medium">
                Executes intent diagnosis, cognitive routing, and master prompt synthesis in a single unified API pass (50% quota & latency reduction).
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] font-medium text-[#4E342E]/80 border-t border-[#4E342E]/10">
                <span>Active Model:</span>
                <span className="font-bold text-[#C62828]">{engine === 'gemini' ? 'Gemini 3 Flash' : 'Groq Llama-3.3'}</span>
              </div>
            </div>

            {/* Live Quality Optimization Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[#4E342E]/20 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C62828]" />
                  <h3 className="text-xs font-bold text-[#1B0E07] uppercase tracking-wider">
                    Quality Boost
                  </h3>
                </div>
                <span className="text-[11px] font-extrabold text-[#C62828]">
                  +80% Avg.
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#4E342E]">
                  <span>Raw One-Liner Input:</span>
                  <span className="font-bold font-mono text-red-600">~15%</span>
                </div>
                <div className="w-full bg-[#4E342E]/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[15%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#4E342E] pt-1">
                  <span>Synthesized Master Prompt:</span>
                  <span className="font-bold font-mono text-emerald-700">95% – 98%</span>
                </div>
                <div className="w-full bg-[#4E342E]/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[96%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onToggleStar={handleToggleStar}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C62828] border border-[#FFB74D] text-white text-xs font-bold shadow-xl shadow-[#C62828]/30 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FFB74D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-[#4E342E]/15 py-5 text-center text-xs text-[#4E342E]/80 font-medium">
        <div className="w-full max-w-[1720px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PromptBridge © 2026 • Universal AI Prompt Engineering Command Center</span>
          <span className="font-mono text-[11px] text-[#4E342E]/60">Gemini 3 Flash • Groq Llama-3.3 • 1-Pass Architecture</span>
        </div>
      </footer>
    </div>
  );
}
