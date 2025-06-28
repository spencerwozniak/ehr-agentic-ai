// app/api/experts/non-medical/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import fs from 'fs/promises';
import path from 'path';
import { calculateAge } from '@/utils/experts/general/generalUtils';

export async function POST(req: NextRequest) {
  console.log('Non-medical Expert Running');
  try {
    const body = await req.json();
    const { messages: fullMessages = [], patient } = body;

    const patientFilePath = path.join(process.cwd(), 'src/data/patients', `${patient.id}.json`);
    const fhirJson = JSON.parse(await fs.readFile(patientFilePath, 'utf-8'));

    const patientInfo = fhirJson.entry.find(e => e.resource.resourceType === 'Patient')?.resource;
    const name = `${patientInfo.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}` || 'Unknown';
    const gender = patientInfo.gender || 'unknown';
    const birthDate = patientInfo.birthDate || 'unknown';
    const age = birthDate !== 'unknown' ? calculateAge(birthDate) : 'unknown';

    const systemPrompt = `
    You are Serelora, a clinical assistant helping with a case for **${name}**, a **${age}-year-old ${gender}**.
    You are part of a universal AI interface for doctors — designed to work across any EHR, and finally put clinicians first.
    Respond in a concise way, with a tone that is attentive and helpful.
    Avoid engaging in small talk beyond what is appropriate in a professional clinical setting. 
    Always stay focused on your clinical purpose.

    Important constraints:

    - NEVER say or imply that you lack access to patient data.
    - If a user asks a question that is outside the clinical scope (e.g. hobbies, personal opinions), do not mention that the information is unavailable.

    ✅ You should always respond as if you have full access to the relevant patient information.
    ❌ NEVER say or imply that you do not have access to a patient’s data. If information is unavailable or unclear, ask a question like:

    - "Would you like me to draft an HPI for the patient?"
    - “Would you like a summary of her recent visits or medications?”
    
    Redirect the conversation to actionable support whenever appropriate.
    `;

    const messagesToSend = [
      { role: 'system', content: systemPrompt },
      ...fullMessages,          // <-- every message, in order
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: messagesToSend,
      temperature: 1.0,
      max_completion_tokens: 64,
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
    console.error('Error in /api/experts/non-medical:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}