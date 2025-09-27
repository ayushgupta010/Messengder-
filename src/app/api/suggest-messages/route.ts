import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'...";

    // Correct UIMessage format
    const messages: Omit<UIMessage, 'id'>[] = [
      {
        role: 'user',
        parts: [prompt], // 'parts' replaces 'content' in latest ai SDK
      },
    ];

    const result = streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages(messages),
      maxDuration,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in /api/suggest-messages:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate questions' }), { status: 500 });
  }
}
