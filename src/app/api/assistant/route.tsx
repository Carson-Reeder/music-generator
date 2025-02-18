import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const ASSISTANT_ID = process.env.ASSISTANT_ID as string;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { scale, threadId } = await request.json();

    if (!scale) {
      return NextResponse.json({ error: 'Scale is required in the request body' }, { status: 400 });
    }

    let thread;
    if (threadId) {
      console.log('Reusing existing thread');
      thread = { id: threadId };
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: `Generate a chord progression in the ${scale} scale.`,
      });
    } else {
      console.log("Creating a new thread...");
      thread = await openai.beta.threads.create({
        messages: [{ role: 'user', content: `Generate a chord progression in the ${scale} scale.` }],
      });
    }

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessageObject = messages.getPaginatedItems().find(msg => msg.role === 'assistant')?.content;

      // Extract the "value" field from the response
      const assistantMessage = Array.isArray(assistantMessageObject)
        ? assistantMessageObject.map(item => item.text?.value).join('\n')
        : "No response from assistant";

      return NextResponse.json({
        message: assistantMessage,
        threadId: thread.id,
      });
    } else {
      return NextResponse.json({ error: "Run did not complete successfully" }, { status: 500 });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}