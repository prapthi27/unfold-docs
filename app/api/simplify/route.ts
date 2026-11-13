import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

type AudienceType = 'Layperson' | 'High School Student' | 'Non-Native Speaker';

function normalizeAudience(input: unknown): AudienceType {
  if (typeof input !== 'string') return 'Layperson';
  const val = input.trim().toLowerCase().replace(/[-_]/g, ' ');
  if (val.includes('high school')) return 'High School Student';
  if (val.includes('non native')) return 'Non-Native Speaker';
  return 'Layperson';
}

function isRetryableError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === 'object') {
    const errorObj = err as Record<string, unknown>;
    const status = errorObj.status ?? errorObj.statusCode ?? errorObj.code;
    if (status === 503 || status === 429 || status === '503' || status === '429') {
      return true;
    }
    if (errorObj.error && typeof errorObj.error === 'object') {
      const nested = errorObj.error as Record<string, unknown>;
      const nestedCode = nested.code ?? nested.status;
      if (
        nestedCode === 503 ||
        nestedCode === 429 ||
        nestedCode === '503' ||
        nestedCode === '429' ||
        nestedCode === 'UNAVAILABLE' ||
        nestedCode === 'RESOURCE_EXHAUSTED'
      ) {
        return true;
      }
    }
  }
  const str = String(err);
  return (
    str.includes('503') ||
    str.includes('429') ||
    str.includes('UNAVAILABLE') ||
    str.includes('RESOURCE_EXHAUSTED') ||
    str.includes('overloaded') ||
    str.includes('rate limit') ||
    str.includes('quota')
  );
}

function formatUserFriendlyErrorMessage(err: unknown): string {
  const rawMsg = err instanceof Error ? err.message : String(err || '');

  if (
    rawMsg.includes('429') ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('rate limit')
  ) {
    return 'The AI service is currently experiencing high demand (rate limit reached). Please wait a moment and try again.';
  }

  if (
    rawMsg.includes('503') ||
    rawMsg.includes('UNAVAILABLE') ||
    rawMsg.includes('overloaded')
  ) {
    return 'The AI service is temporarily overloaded or undergoing maintenance. Please retry in a few seconds.';
  }

  if (rawMsg.includes('API key') || rawMsg.includes('GEMINI_API_KEY')) {
    return 'Invalid or unconfigured Gemini API key. Please check the GEMINI_API_KEY in your .env.local file.';
  }

  if (rawMsg.includes('ENOTFOUND') || rawMsg.includes('fetch failed')) {
    return 'Unable to connect to the Google Gemini service. Please verify your network connection and retry.';
  }

  if (rawMsg.includes('JSON')) {
    return 'Unable to parse the simplified document output. Please try again or test with a different audience setting.';
  }

  // Attempt to extract cleaner human message if raw error contains an embedded JSON object
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*"message"\s*:\s*"([^"]+)"[\s\S]*\}/);
    if (jsonMatch && jsonMatch[1]) {
      return `Simplification notice: ${jsonMatch[1]}`;
    }
  } catch {
    // ignore
  }

  return 'An unexpected issue occurred while simplifying the document. Please try again or test with the sample agreement.';
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GenerateConfigSchema {
  type: string;
  properties: Record<string, unknown>;
  required: string[];
}

/**
 * Gemini API call with automatic 1-shot retry and fallback:
 * 1. Tries `gemini-3.8-flash` first.
 * 2. On 503/429, waits 1.5s and retries `gemini-3.8-flash`.
 * 3. If it still throws 503/429, automatically falls back to `gemini-3.5-flash-lite`.
 */
async function generateWithFallback(
  ai: GoogleGenAI,
  promptText: string,
  responseSchema: GenerateConfigSchema
) {
  const contents = [
    {
      role: 'user',
      parts: [{ text: promptText }],
    },
  ];

  const callModel = async (model: string) => {
    return await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });
  };

  // Step 1: Attempt gemini-3.8-flash
  try {
    return await callModel('gemini-3.8-flash');
  } catch (err: unknown) {
    if (isRetryableError(err)) {
      console.warn(
        'gemini-3.8-flash returned 503/429 overload error. Retrying after 1.5s...'
      );
      await sleep(1500);

      try {
        // Step 2: Quick retry with gemini-3.8-flash
        return await callModel('gemini-3.8-flash');
      } catch (retryErr: unknown) {
        if (isRetryableError(retryErr)) {
          console.warn(
            'gemini-3.8-flash still returned 503/429 after retry. Automatically falling back to gemini-3.5-flash-lite...'
          );
          // Step 3: Fallback to gemini-3.5-flash-lite
          return await callModel('gemini-3.5-flash-lite');
        }
        throw retryErr;
      }
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration notice: GEMINI_API_KEY is not configured in .env.local.' },
        { status: 500 }
      );
    }

    let body: { text?: unknown; audience?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request format. Please provide { text: string, audience: string }.' },
        { status: 400 }
      );
    }

    const { text, audience } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing document content. Please paste text or upload a document to unfold.' },
        { status: 400 }
      );
    }

    const audienceName = normalizeAudience(audience);
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are UnfoldDocs, an expert document simplification and comprehension engine.
Your mission is to translate dense, complex, technical, legal, or financial text into clear, everyday language tailored for a specific audience, while STRICTLY preserving all original meaning, numerical figures, percentages, dates, deadlines, conditions, and legal/contractual obligations.

Target Audience: ${audienceName}
${
  audienceName === 'Layperson'
    ? '- Tone: Plain conversational English (Grade 7-8 reading level). Eliminate legalese, latinisms, and obscure terminology without losing any original meaning, money amounts, or deadlines.'
    : audienceName === 'High School Student'
    ? '- Tone: Accessible, engaging, and educational (Grade 9-10 reading level). Use relatable phrasing and helpful contextual analogies.'
    : '- Tone: Simple, direct, and international English (Grade 5-6 reading level). Short sentences, common active vocabulary, zero idioms.'
}

Strict Fidelity & Quality Rules:
1. Every numerical figure, dollar amount, percentage, date, and deadline from the original text MUST be preserved accurately in the simplified text. Never round, alter, or omit numbers or conditions.
2. Provide 3 to 5 concise bullet points in "keyTakeaways" summarizing the critical rights, obligations, or takeaways.
3. Identify 3 to 8 complex, technical, or jargon terms present in the original text and provide plain-English contextual definitions in the "glossary" array.
4. Output strictly valid JSON matching the requested schema.`;

    const userPrompt = `Document to simplify for audience [${audienceName}]:

"""
${text.trim()}
"""`;

    const responseSchema: GenerateConfigSchema = {
      type: 'object',
      properties: {
        simplifiedText: {
          type: 'string',
          description: 'The rewritten text tailored to the audience, preserving all facts and numbers.',
        },
        keyTakeaways: {
          type: 'array',
          items: { type: 'string' },
          description: '3-5 concise bullet points of critical obligations or takeaways.',
        },
        glossary: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              term: {
                type: 'string',
                description: 'Complex term from the original document',
              },
              definition: {
                type: 'string',
                description: 'Plain-English meaning in context',
              },
            },
            required: ['term', 'definition'],
          },
          description: 'Key jargon terms defined in simple terms.',
        },
      },
      required: ['simplifiedText', 'keyTakeaways', 'glossary'],
    };

    // Execute call with retry & model fallback helper
    const response = await generateWithFallback(
      ai,
      `${systemPrompt}\n\n${userPrompt}`,
      responseSchema
    );

    const responseText = response?.text || '';
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    let parsed: {
      simplifiedText?: string;
      keyTakeaways?: string[];
      glossary?: { term: string; definition: string }[];
    };

    try {
      parsed = JSON.parse(responseText);
    } catch {
      try {
        const cleanJson = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
        parsed = JSON.parse(cleanJson);
      } catch {
        throw new Error('Failed to parse structured JSON response from Gemini model.');
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON structure returned by Gemini model.');
    }

    return NextResponse.json({
      simplifiedText: typeof parsed.simplifiedText === 'string' ? parsed.simplifiedText : '',
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
      glossary: Array.isArray(parsed.glossary) ? parsed.glossary : [],
    });
  } catch (err: unknown) {
    console.error('Error in /api/simplify:', err);
    const friendlyMessage = formatUserFriendlyErrorMessage(err);
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}
