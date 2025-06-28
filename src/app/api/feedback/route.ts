import { NextRequest, NextResponse } from "next/server";
import fs from 'fs/promises';
import path from "path";
import { all } from "axios";

const FEEDBACK_COUNTER = path.join(process.cwd(), 'src', 'data', 'feedback', 'feedback_counter.json')
const FEEDBACK_PATH = path.join(process.cwd(), 'src', 'data', 'feedback', 'feedback.json')

async function readJson(filePath: string) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    return {};
  }
}

async function writeJson(filePath: string, data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  const feedback = await req.json();
  const { agentName, action } = feedback;


  // Store complete feedback information with message
  let allFeedback = [];
  try {
    const content = await fs.readFile(FEEDBACK_PATH, 'utf8');
    allFeedback = JSON.parse(content);
  } catch (error) {
    console.log(error);
    allFeedback = [];
  }

  allFeedback.push(feedback);
  await writeJson(FEEDBACK_PATH, allFeedback);


  // Store count of likes and dislikes by agent
  let counter = await readJson(FEEDBACK_COUNTER);

  if (!counter[agentName]) counter[agentName] = { like: 0, dislike: 0 };
	
  if (action === 'like') counter[agentName].like += 1;
  if (action === 'dislike') counter[agentName].dislike += 1;

  await writeJson(FEEDBACK_COUNTER, counter);

  return NextResponse.json({ success: true, counter: counter[agentName]});

}
