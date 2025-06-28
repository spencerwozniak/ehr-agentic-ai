// app/api/experts/lab/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import fs from 'fs/promises';
import path from 'path';
import { getLabSummaryPrompt } from '@/utils/experts/lab/labUtils';

export async function POST(req: NextRequest) {
  console.log('Lab Expert Running');
  try {
    const body = await req.json();
    const { messages: fullMessages = [], patient } = body;

    const patientFilePath = path.join(process.cwd(), 'src/data/patients', `${patient.id}.json`);
    const fhirJson = JSON.parse(await fs.readFile(patientFilePath, 'utf-8'));

    const systemPrompt = getLabSummaryPrompt(fhirJson);

    const messagesToSend = [
      { role: 'system', content: systemPrompt },
      ...fullMessages,
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: messagesToSend,
      temperature: 0.2,
      max_completion_tokens: 2048,
      stream: true,
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
    console.error('Error in /api/experts/lab:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}