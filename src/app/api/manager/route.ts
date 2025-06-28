// app/api/manager/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import expertsMetadata from '@/data/experts.json';

// --- Summarization helpers (unchanged) ---
const MAX_MODEL_TOKENS = 1_047_576;
const MAX_OUTPUT_TOKENS = 256;
const TOKEN_HEADROOM = 2_000;
const CHUNK_SIZE = 10;

/** Very rough token estimate: ~1.5 tokens/word + overhead */
function estimateTokens(msgs: { role: string; content: string }[]) {
  const wordCount = msgs.reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);
  return Math.ceil(wordCount * 1.5) + msgs.length * 4;
}

/** Summarize a slice via gpt-4.1-nano */
async function summarizeChunk(
  chunk: { role: string; content: string }[]
): Promise<string> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [
      { role: 'system', content: 'You are a concise summarizer. Produce 3–5 bullet points.' },
      ...chunk,
      { role: 'user', content: 'Summarize the above in 3–5 bullet points.' },
    ],
    max_tokens: 256,
  });
  return res.choices[0].message!.content!.trim();
}

async function compressHistory(
  fullHistory: { role: string; content: string }[]
) {
  let context = [...fullHistory];
  let didSummarize = false;

  while (
    estimateTokens(context) + MAX_OUTPUT_TOKENS + TOKEN_HEADROOM >
    MAX_MODEL_TOKENS
  ) {
    didSummarize = true;
    // take the oldest CHUNK_SIZE messages
    const slice = context.slice(0, CHUNK_SIZE);
    const summary = await summarizeChunk(slice);
    // replace them with a single summary node
    context = [
      { role: 'system', content: `SUMMARY of earlier conversation:\n${summary}` },
      ...context.slice(CHUNK_SIZE),
    ];
  }

  return { compressed: context, didSummarize };
}

// --- Main manager endpoint ---
export async function POST(req: NextRequest) {
  try {
    const { messages = [], patient, expert } = await req.json();

    // Require expert field; for full backward compatibility, you could fallback to classification here.
    if (!expert) {
      return NextResponse.json({ error: 'Expert is required. Classify first.' }, { status: 400 });
    }

    const { compressed, didSummarize } = await compressHistory(messages);
    const toForward = didSummarize ? compressed : messages;

    const expertUrl = `${req.nextUrl.origin}/api/experts/${expert}`;

    // Call the expert API with streaming enabled
    const expertRes = await fetch(expertUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: toForward, patient }),
    });

    // If the expert API doesn't return a stream, return as JSON fallback
    if (!expertRes.body) {
      const text = await expertRes.text();
      return NextResponse.json({ response: text }, { status: expertRes.status });
    }

    // Pipe the expert response stream through to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = expertRes.body!.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }

        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Error in /api/manager:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
