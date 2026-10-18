export type TargetLLM = 'universal' | 'claude' | 'chatgpt' | 'deepseek';

export type EngineType = 'groq' | 'gemini';

export type FrameworkType =
  | '11-POINT'
  | 'CO-STAR'
  | 'RISEN'
  | 'CREATE'
  | 'CRISPE'
  | 'RTF'
  | 'RACE'
  | 'TAG'
  | 'APE'
  | 'BAB'
  | 'CARE'
  | 'ROSES';

export type ReasoningAddon = 'NONE' | 'CoT' | 'ToT';

export interface ClarifyingQuestion {
  id: string;
  question: string;
  allow_multiple: boolean;
  options: string[];
}

export interface AnalyzeAndAskRequest {
  rawInput: string;
  antiFluff: boolean;
  targetLLM: TargetLLM;
  engine: EngineType;
}

export interface AnalyzeAndAskResponse {
  detected_intent: string;
  selected_framework: FrameworkType;
  reasoning_addon: ReasoningAddon;
  quality_score_initial: number;
  clarifying_questions: ClarifyingQuestion[];
}

export interface GenerateMasterPromptRequest {
  rawInput: string;
  selectedFramework: string;
  reasoningAddon: string;
  answers: Record<string, string[]>;
  targetLLM: TargetLLM;
  antiFluff: boolean;
  engine: EngineType;
}

export interface GenerateMasterPromptResponse {
  master_prompt: string;
  upgrades_applied: string[];
  has_placeholders: boolean;
  quality_score_final: number;
  target_model_recommendation: string;
}

export interface UnifiedMasterPromptRequest {
  rawInput: string;
  targetLLM: TargetLLM;
  antiFluff: boolean;
  engine: EngineType;
}

export interface UnifiedMasterPromptResponse {
  detected_intent: string;
  selected_framework: FrameworkType;
  reasoning_addon: ReasoningAddon;
  quality_score_initial: number;
  quality_score_final: number;
  upgrades_applied: string[];
  assumptions_inferred: string[];
  master_prompt: string;
  has_placeholders: boolean;
  target_model_recommendation: string;
}

export interface FrameworkDefinition {
  id: FrameworkType;
  name: string;
  category: 'Heavyweight' | 'Fast & Punchy' | 'Domain & Transformation';
  bestFor: string;
  components: {
    key: string;
    label: string;
    description: string;
  }[];
}

export interface PromptHistoryItem {
  id: string;
  timestamp: number;
  rawInput: string;
  masterPrompt: string;
  framework: FrameworkType;
  targetLLM: TargetLLM;
  qualityInitial: number;
  qualityFinal: number;
  isStarred: boolean;
}

export interface AuthUser {
  username: string;
  email: string;
  createdAt?: number;
}

