import { getAIProvider } from "@/ai/factory";
import { AI_MODELS } from "@/lib/models";

import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, apiKey, model } = await req.json();

    if (!message || !apiKey || !model) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const modelConfig = AI_MODELS.find((m) => m.id === model);
    if (!modelConfig) {
      return Response.json({ error: "Model not found" }, { status: 400 });
    }

    const aiProvider = getAIProvider({
      provider: modelConfig.provider,
      apiKey,
      openRouter: false
    });

    if (!aiProvider) {
      return Response.json({ error: "Provider not supported" }, { status: 400 });
    }

    const titlePrompt = `Generate a concise, descriptive title (max 50 characters) for a chat that starts with this user message: "${message}". 

Rules:
- Be specific and descriptive
- Avoid generic words like "Chat", "Question", "Help"
- Focus on the main topic or intent
- Use title case
- No quotes or special characters

Examples:
- "How to center a div in CSS" → "CSS Div Centering Techniques"
- "Explain quantum computing" → "Quantum Computing Fundamentals"
- "Recipe for chocolate cake" → "Chocolate Cake Recipe"

Title:`;

    const result = await aiProvider.chat({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates concise, descriptive titles for chat conversations. Respond with only the title, nothing else."
        },
        {
          role: "user",
          content: titlePrompt
        }
      ],
      stream: false,
      temperature: 0.3,
      maxTokens: 20,
      model
    });

    if (typeof result === "object" && "content" in result) {
      const title = result.content.trim().replace(/^["']|["']$/g, "");
      return Response.json({ title });
    }

    return Response.json({ title: `Chat about ${message.slice(0, 30)}...` });
  } catch (error) {
    console.error("Error generating chat title:", error);
    return Response.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
