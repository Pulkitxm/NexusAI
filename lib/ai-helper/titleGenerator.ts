import { generateObject } from "ai";
import { z } from "zod";

import { AI_MODELS } from "@/data/models";
import { getAiProvider } from "@/lib/ai-helper/get-provider";

import { debugError, debugLog } from "../utils";

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

    debugLog("Generating chat title", { message, apiKey, modelUUId, openRouter });

    const model = AI_MODELS.find((m) => m.uuid === modelUUId);

    if (!model) {
      debugError("Model not found", { modelUUId });
      return { success: false, error: "Model not found" };
    }

    debugLog("Model found", { model });

    debugLog("Getting AI Provider", {
      modelProvider: model.provider,
      apiKey,
      openRouter,
      finalModelId: model.id
    });

    const aiProviderRes = getAiProvider({
      modelProvider: model.provider,
      apiKey,
      openRouter,
      finalModelId: model.id
    });

    debugLog("AI Provider result", { aiProviderRes });

    if (!aiProviderRes.success) {
      debugError("Provider not supported", { model });
      return { success: false, error: "Provider not supported" };
    }

    const aiProvider = aiProviderRes.aiModel;

    debugLog("AI Provider", { aiProvider });

    const titlePrompt = `Generate a concise, descriptive title (max 50 characters) for a chat that starts with this user message: "${message}".
    
  Rules:
  - Create a specific, descriptive title between 3-50 characters
  - Capture the main topic or intent of the conversation
  - Use title case formatting
  - Avoid generic terms like "Chat", "Question", "Help", "Conversation"
  - Don't include quotes or special characters
  - Don't use phrases like "Title for" or "Chat about"
  
  Examples:
  - User asks about CSS: "CSS Flexbox Layout Guide"
  - User asks about science: "Quantum Physics Explained"
  - User needs coding help: "React Hook Implementation"
  - User wants creative content: "Sci-Fi Story Premise"
  
  IMPORTANT: Return ONLY valid JSON with a 'title' field like: {"title": "Your Generated Title"}
  `;

    const result = await generateObject({
      model: aiProvider,
      schema: TitleSchema,
      prompt: titlePrompt,
      temperature: 0.3
    });

    debugLog("Title generation result", { result });

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
