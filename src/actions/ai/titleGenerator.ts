import { generateObject } from "ai";
import { z } from "zod";

import { getAiProvider } from "@/lib/ai-helper";
import { AI_MODELS } from "@/lib/models";

const TitleSchema = z.object({
  title: z.string().min(1)
});

export async function generateChatTitle({
  apiKey,
  message,
  modelUUId,
  openRouter
}: {
  message: string;
  apiKey: string;
  modelUUId: string;
  openRouter?: boolean;
}) {
  try {
    if (!message || !apiKey || !modelUUId) {
      return { success: false, error: "Missing required fields" };
    }

    console.log({
      apiKey,
      message,
      modelUUId,
      openRouter
    });

    const model = AI_MODELS.find((m) => m.uuid === modelUUId);

    if (!model) {
      return { success: false, error: "Model not found" };
    }

    const aiProviderRes = getAiProvider({
      modelProvider: model.provider,
      apiKey,
      openRouter,
      finalModelId: model.id
    });

    if (!aiProviderRes.success) {
      return { success: false, error: "Provider not supported" };
    }

    const aiProvider = aiProviderRes.aiModel;

    const titlePrompt = `Generate a concise, descriptive title (max 50 characters) for a chat that starts with this user message: "${message}". The title must be between 3-50 characters and must not be empty. It should be relevant to the user message.
  
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
  
  IMPORTANT: Return ONLY valid JSON with a 'title' field like: {"title": "Your Generated Title"}
  `;

    const result = await generateObject({
      model: aiProvider,
      schema: TitleSchema,
      prompt: titlePrompt,
      temperature: 0.3
    });

    if (result.object.title && result.object.title.trim() !== "") {
      return { success: true, title: result.object.title.trim() };
    }

    return { success: false, error: "Failed to generate title" };
  } catch (error) {
    console.error("Error generating chat title:", error);
    if (error instanceof Error && error.message.includes("JSON parsing failed")) {
      try {
        const errorMessage = error.toString();
        const match = errorMessage.match(/Text: ([^@]+)/);
        if (match && match[1]) {
          const extractedTitle = match[1].trim();
          if (extractedTitle) {
            return { success: true, title: extractedTitle };
          }
        }
      } catch (recoveryError) {
        console.error("Failed to recover from JSON parsing error:", recoveryError);
      }
    }
    return { success: false, error: "Failed to generate title" };
  }
}
