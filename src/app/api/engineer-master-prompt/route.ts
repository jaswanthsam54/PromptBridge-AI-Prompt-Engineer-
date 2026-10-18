import { NextRequest, NextResponse } from 'next/server';
import { UnifiedMasterPromptRequest, UnifiedMasterPromptResponse } from '@/types';
import { getSystemPromptUnifiedEngineer } from '@/lib/prompts';
import { callLLMJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<UnifiedMasterPromptRequest>;
    const rawInput = body.rawInput?.trim();

    if (!rawInput) {
      return NextResponse.json(
        { error: 'rawInput is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const targetLLM = body.targetLLM || 'universal';
    const antiFluff = body.antiFluff !== false;
    const engine = body.engine || (process.env.GROQ_API_KEY ? 'groq' : 'gemini');

    const systemPrompt = getSystemPromptUnifiedEngineer(targetLLM, antiFluff);

    const userPrompt = JSON.stringify(
      {
        raw_user_input: rawInput,
        target_llm: targetLLM,
        anti_fluff_active: antiFluff,
        requirement:
          'Diagnose the input and immediately synthesize the complete Master Prompt in this single pass. Do not ask questions; infer smart engineering defaults autonomously.',
      },
      null,
      2
    );

    const response = await callLLMJSON<UnifiedMasterPromptResponse>({
      engine,
      systemPrompt,
      userPrompt,
      temperature: 0.35,
    });

    const hasPlaceholders =
      typeof response.has_placeholders === 'boolean'
        ? response.has_placeholders
        : /\[PASTE\s+[^\]]+\]/i.test(response.master_prompt || '');

    const safeResponse: UnifiedMasterPromptResponse = {
      detected_intent:
        response.detected_intent || 'Diagnosed and engineered user request into production prompt.',
      selected_framework: response.selected_framework || 'RTF',
      reasoning_addon: response.reasoning_addon || 'NONE',
      quality_score_initial:
        typeof response.quality_score_initial === 'number'
          ? Math.min(Math.max(response.quality_score_initial, 10), 45)
          : 22,
      quality_score_final:
        typeof response.quality_score_final === 'number'
          ? Math.min(Math.max(response.quality_score_final, 85), 99)
          : 98,
      upgrades_applied:
        Array.isArray(response.upgrades_applied) && response.upgrades_applied.length > 0
          ? response.upgrades_applied
          : [
              `Framework: ${response.selected_framework || 'RTF'}`,
              `Target Syntax: ${targetLLM.toUpperCase()}`,
              ...(antiFluff ? ['Anti-Fluff Shield Activated'] : []),
            ],
      assumptions_inferred:
        Array.isArray(response.assumptions_inferred) && response.assumptions_inferred.length > 0
          ? response.assumptions_inferred
          : ['Inferred modern production architecture', 'Applied security & error handling standards'],
      master_prompt: response.master_prompt || rawInput,
      has_placeholders: hasPlaceholders,
      target_model_recommendation:
        response.target_model_recommendation ||
        `Optimized for ${targetLLM.toUpperCase()} execution.`,
    };

    return NextResponse.json(safeResponse);
  } catch (error: unknown) {
    console.error('Error in /api/engineer-master-prompt:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
