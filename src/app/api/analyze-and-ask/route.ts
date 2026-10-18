import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeAndAskRequest, AnalyzeAndAskResponse } from '@/types';
import { SYSTEM_PROMPT_ANALYZE_AND_ASK } from '@/lib/prompts';
import { callLLMJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AnalyzeAndAskRequest>;
    const rawInput = body.rawInput?.trim();

    if (!rawInput) {
      return NextResponse.json(
        { error: 'rawInput is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const targetLLM = body.targetLLM || 'universal';
    const antiFluff = !!body.antiFluff;
    const engine = body.engine || (process.env.GROQ_API_KEY ? 'groq' : 'gemini');

    const userPrompt = JSON.stringify(
      {
        user_raw_input: rawInput,
        target_llm: targetLLM,
        anti_fluff_requested: antiFluff,
      },
      null,
      2
    );

    const response = await callLLMJSON<AnalyzeAndAskResponse>({
      engine,
      systemPrompt: SYSTEM_PROMPT_ANALYZE_AND_ASK,
      userPrompt,
      temperature: 0.3,
    });

    // Ensure safe defaults if fields were omitted by the model
    const safeResponse: AnalyzeAndAskResponse = {
      detected_intent:
        response.detected_intent || 'Optimize and clarify the user objective into an engineered prompt.',
      selected_framework: response.selected_framework || 'RTF',
      reasoning_addon: response.reasoning_addon || 'NONE',
      quality_score_initial:
        typeof response.quality_score_initial === 'number'
          ? Math.min(Math.max(response.quality_score_initial, 5), 60)
          : 22,
      clarifying_questions: Array.isArray(response.clarifying_questions)
        ? response.clarifying_questions.slice(0, 4).map((q, idx) => ({
            id: q.id || `q${idx + 1}`,
            question: q.question || 'What is your primary deliverable?',
            allow_multiple: Boolean(q.allow_multiple),
            options: Array.isArray(q.options) && q.options.length > 0
              ? q.options.slice(0, 4)
              : ['Standard Production Quality', 'High Performance / Optimized', 'Minimalist / Lightweight'],
          }))
        : [
            {
              id: 'q1',
              question: 'What is the primary target context or tech stack?',
              allow_multiple: true,
              options: ['Full-stack Web', 'Python / AI Backend', 'Mobile / Native', 'DevOps / Cloud'],
            },
          ],
    };

    return NextResponse.json(safeResponse);
  } catch (error: unknown) {
    console.error('Error in /api/analyze-and-ask:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
