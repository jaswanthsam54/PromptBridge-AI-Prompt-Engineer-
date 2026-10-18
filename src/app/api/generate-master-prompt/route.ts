import { NextRequest, NextResponse } from 'next/server';
import { GenerateMasterPromptRequest, GenerateMasterPromptResponse } from '@/types';
import { getSystemPromptGenerateMasterPrompt } from '@/lib/prompts';
import { callLLMJSON } from '@/lib/llm';
import { FRAMEWORKS } from '@/lib/frameworks';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<GenerateMasterPromptRequest>;
    const rawInput = body.rawInput?.trim();

    if (!rawInput) {
      return NextResponse.json(
        { error: 'rawInput is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const selectedFramework = body.selectedFramework || 'RTF';
    const reasoningAddon = body.reasoningAddon || 'NONE';
    const answers = body.answers || {};
    const targetLLM = body.targetLLM || 'universal';
    const antiFluff = !!body.antiFluff;
    const engine = body.engine || (process.env.GROQ_API_KEY ? 'groq' : 'gemini');

    // Retrieve framework details
    const frameworkMeta = FRAMEWORKS[selectedFramework as keyof typeof FRAMEWORKS];

    const systemPrompt = getSystemPromptGenerateMasterPrompt(targetLLM, antiFluff);

    const userPrompt = JSON.stringify(
      {
        mission: 'Synthesize the Master Prompt strictly according to specifications.',
        raw_user_input: rawInput,
        assigned_framework: {
          name: selectedFramework,
          full_name: frameworkMeta?.name || selectedFramework,
          components: frameworkMeta?.components || [],
        },
        reasoning_addon: reasoningAddon,
        clarification_answers: answers,
        target_llm: targetLLM,
        anti_fluff_shield_active: antiFluff,
        placeholder_instruction:
          'If the engineered prompt requires the user to supply their code, logs, text, or schema, insert high-visibility placeholders like [PASTE YOUR CODE HERE] or [PASTE YOUR LOGS HERE].',
      },
      null,
      2
    );

    const response = await callLLMJSON<GenerateMasterPromptResponse>({
      engine,
      systemPrompt,
      userPrompt,
      temperature: 0.35,
    });

    // Detect if placeholders exist in the prompt
    const hasPlaceholders =
      typeof response.has_placeholders === 'boolean'
        ? response.has_placeholders
        : /\[PASTE\s+[^\]]+\]/i.test(response.master_prompt || '');

    const safeResponse: GenerateMasterPromptResponse = {
      master_prompt:
        response.master_prompt ||
        `# Master Prompt\n\n**Role**: Expert System Architect\n**Task**: ${rawInput}\n**Format**: Production-grade, structured specification.`,
      upgrades_applied:
        Array.isArray(response.upgrades_applied) && response.upgrades_applied.length > 0
          ? response.upgrades_applied
          : [
              `Framework Applied: ${selectedFramework}`,
              `Target Syntax: ${targetLLM.toUpperCase()}`,
              ...(antiFluff ? ['Anti-Fluff Shield Activated'] : []),
              ...(reasoningAddon !== 'NONE' ? [`Reasoning: ${reasoningAddon} Injected`] : []),
            ],
      has_placeholders: hasPlaceholders,
      quality_score_final:
        typeof response.quality_score_final === 'number'
          ? Math.min(Math.max(response.quality_score_final, 85), 99)
          : 96,
      target_model_recommendation:
        response.target_model_recommendation ||
        `Optimized for ${targetLLM.charAt(0).toUpperCase() + targetLLM.slice(1)} execution.`,
    };

    return NextResponse.json(safeResponse);
  } catch (error: unknown) {
    console.error('Error in /api/generate-master-prompt:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
