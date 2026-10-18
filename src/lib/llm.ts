import { EngineType } from '@/types';

interface LLMCallOptions {
  engine?: EngineType;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export async function callLLMJSON<T>(options: LLMCallOptions): Promise<T> {
  const { engine = 'groq', systemPrompt, userPrompt, temperature = 0.4 } = options;

  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // Primary preference check
  if (engine === 'groq') {
    if (groqKey) {
      try {
        return await callGroq<T>(groqKey, systemPrompt, userPrompt, temperature);
      } catch (err) {
        console.warn('Groq call failed, attempting fallback to Gemini if key available:', err);
        if (geminiKey) {
          return await callGemini<T>(geminiKey, systemPrompt, userPrompt, temperature);
        }
        throw err;
      }
    } else if (geminiKey) {
      return await callGemini<T>(geminiKey, systemPrompt, userPrompt, temperature);
    }
  } else {
    if (geminiKey) {
      try {
        return await callGemini<T>(geminiKey, systemPrompt, userPrompt, temperature);
      } catch (err) {
        console.warn('Gemini call failed, attempting fallback to Groq if key available:', err);
        if (groqKey) {
          return await callGroq<T>(groqKey, systemPrompt, userPrompt, temperature);
        }
        throw err;
      }
    } else if (groqKey) {
      return await callGroq<T>(groqKey, systemPrompt, userPrompt, temperature);
    }
  }

  // If no keys configured at all, throw a clear error explaining how to configure .env.local
  throw new Error(
    'No valid API key found. Please add GROQ_API_KEY or GEMINI_API_KEY to your .env.local file. (Both offer 100% free tiers: console.groq.com / aistudio.google.com)'
  );
}

async function callGroq<T>(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number
): Promise<T> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Groq returned an empty response.');
  }

  return cleanAndParseJSON<T>(rawContent);
}

async function callGemini<T>(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number
): Promise<T> {
  const model = 'gemini-3-flash-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) {
    throw new Error('Gemini returned an empty response.');
  }

  return cleanAndParseJSON<T>(rawContent);
}

function cleanAndParseJSON<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip markdown code fences if model returned ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  return JSON.parse(cleaned) as T;
}
