// app/api/experts/medications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import fs from 'fs/promises';
import path from 'path';
import { extractMedsPrompt } from '@/utils/experts/medications/medsUtils';

export async function POST(req: NextRequest) {
  console.log('Medications Expert Running');
  try {
    const body = await req.json();
    const { messages: fullMessages = [], patient } = body;

    const patientFilePath = path.join(process.cwd(), 'src/data/patients', `${patient.id}.json`);
    const fhirJson = JSON.parse(await fs.readFile(patientFilePath, 'utf-8'));

    const systemPrompt = extractMedsPrompt(fhirJson);

    const messagesToSend = [
      { role: 'system', content: systemPrompt },
      ...fullMessages,          // <-- every message, in order
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: messagesToSend,
      temperature: 0.2,
      max_completion_tokens: 2048,
      stream: true, // 🟢 Enables streaming
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of response) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
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

  } catch (error) {
    console.error('Error in /api/experts/medications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}