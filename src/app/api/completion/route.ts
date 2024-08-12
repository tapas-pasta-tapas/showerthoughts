import { Content } from "@google/generative-ai";
import { GeminiMessage } from "@/types";

export async function POST(request: Request) {
  try {
    const { VertexAI } = require("@google-cloud/vertexai");
    const vertex_ai = new VertexAI({
      project: "sonorous-earth-430515-u7",
      location: "us-central1",
    });
    const model = "gemini-1.5-flash-001";

    const json = await request.json();
    const { messages } = json as {
      messages: Content[];
    };

    const sysInstruction = `
You are a Friendly AI Journaling Companion called Lumina.

Purpose:
The AI journaling companion's primary role is to affirm the user's reflections, ask thoughtful questions, and help the user deepen their self-reflection and introspection during their journaling sessions.

Behavior Guidelines:
1. Friendly and Supportive Tone
   - Use a warm, encouraging, and empathetic tone.
   - Always affirm the user's reflections positively.

2. Active Listening
   - Acknowledge the user's entries by summarizing or reflecting back key points.
   - Show understanding and empathy toward the user's experiences.

3. Encouraging Depth and Insight
   - Ask open-ended, reflective questions that encourage deeper thinking.
   - Help the user explore their feelings, thoughts, and experiences further.

4. Avoid repetition.
    - Do not repeat your own questions or responses, by checking against your previous messages.
    - Do not repeat the user's input verbatim, and do not give redundant suggestions.
    - Focus on adding value to the conversation by bringing new perspectives or deepening the reflection.`;

    // const vertexAIRetrievalTool = {
    //   retrieval: {
    //     vertexAiSearch: {
    //       datastore:
    //         "projects/1021020983034/locations/global/collections/default_collection/dataStores/carelyn-rag_1716447979086",
    //     },
    //     disableAttribution: false,
    //   },
    // };
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: model,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 1,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
      // tools: [
      //     vertexAIRetrievalTool
      // ],
      systemInstruction: {
        role: "system",
        parts: [{ text: sysInstruction }],
      },
    });
    // const lastMessage = messages.pop() as GeminiMessage;

    // const chat = generativeModel.startChat({
    //   history: messages,
    // });

    // const response = await chat.sendMessageStream(lastMessage.parts);
    // console.log(text);
    // const req = {
    //   contents: [{ role: "user", parts: [{ text: text }] }],
    // };
    // const response = await generativeModel.generateContentStream(req);
    const lastMessage = messages.pop() as GeminiMessage;

    const chat = generativeModel.startChat({
      history: messages,
    });

    const response = await chat.sendMessageStream(lastMessage.parts);
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response.stream) {
          if (
            chunk.candidates !== undefined &&
            chunk.candidates[0].content.parts !== undefined
          ) {
            const chunkText = chunk.candidates[0].content.parts[0].text;
            controller.enqueue(encoder.encode(chunkText));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred";
    const errorCode = error.status || 500;

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Google Gemini API Key not found. Please set it in your profile settings.";
    } else if (errorMessage.toLowerCase().includes("api key not valid")) {
      errorMessage =
        "Google Gemini API Key is incorrect. Please fix it in your profile settings.";
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
    });
  }
}
