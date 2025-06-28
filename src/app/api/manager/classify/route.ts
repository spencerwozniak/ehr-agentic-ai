import { NextRequest, NextResponse } from 'next/server';
import expertsMetadata from '@/data/experts.json';
import { openai } from '@/lib/openai';

// Same EXPERTS and helper functions as before
const EXPERTS = expertsMetadata.map(e => e.name);

function buildRoutingPrompt() {
  const descriptions = expertsMetadata
    .map(e => `- ${e.name}: ${e.description}`)
    .join('\n');
  return `You are a routing manager. Given the following two messages (last assistant and last user), select exactly one expert to handle the request. Available experts with descriptions:\n${descriptions}\n\nRespond only with the expert name.`;
}

function getLastMessages(messages: { role: string; content: string }[]) {
  let lastUser = null, lastAssistant = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (!lastUser && messages[i].role === 'user') lastUser = messages[i];
    else if (!lastAssistant && messages[i].role === 'assistant') lastAssistant = messages[i];
    if (lastUser && lastAssistant) break;
  }
  return [lastAssistant, lastUser].filter(Boolean) as { role: string; content: string }[];
}

async function classifyExpert(messages: { role: string; content: string }[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: buildRoutingPrompt() },
      ...getLastMessages(messages),
    ],
    temperature: 0.0,
    max_tokens: 10,
  });
  const choice = response.choices[0].message!.content.trim();
  return EXPERTS.includes(choice) ? choice : 'general';
}

export async function POST(req: NextRequest) {
  try {
    const { messages = [] } = await req.json();
    const expert = await classifyExpert(messages);
    return NextResponse.json({ expert });
  } catch (err) {
    console.error('Error in /api/manager/classify:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
