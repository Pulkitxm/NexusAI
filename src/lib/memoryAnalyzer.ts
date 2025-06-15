import { z } from "zod";

import { getAIProvider } from "@/ai/factory";
import { prisma } from "@/lib/db";
import { AI_MODELS } from "@/lib/models";

const MemorySchema = z.object({
  memories: z.array(
    z.object({
      content: z.string().min(1),
      category: z.enum(["personal", "professional", "preferences", "knowledge", "other"]),
      importance: z.number().min(1).max(10),
      reasoning: z.string().min(1)
    })
  )
});

export async function analyzeAndStoreMemories(
  userId: string,
  userMessage: string,
  assistantResponse: string,
  apiKey: string,
  modelId: string,
  openRouter: boolean
) {
  try {
    const modelConfig = AI_MODELS.find((m) => m.id === modelId);
    if (!modelConfig) {
      console.error(`[Memory] Model "${modelId}" not found`);
      return { success: false, error: "Model not found" };
    }

    const aiProvider = getAIProvider({
      provider: modelConfig.provider,
      apiKey,
      openRouter
    });

    if (!aiProvider) {
      console.error("[Memory] Invalid AI provider");
      return { success: false, error: "Invalid AI provider" };
    }

    const response = await aiProvider.chat({
      messages: [
        {
          role: "system",
          content: `You are a memory analyzer. Your task is to analyze conversations and extract important information about the user.

Analyze this conversation and extract important information that should be remembered about the user for future conversations.

User Message: "${userMessage}"
Assistant Response: "${assistantResponse}"

Extract memories that are:
1. Personal facts (name, family, interests, goals, experiences)
2. Professional information (job, skills, projects, career goals)
3. Preferences (likes, dislikes, communication style, tools they use)
4. Knowledge areas (expertise, learning interests, technical skills)
5. Other important context

Rate importance 1-10 where:
- 1-3: Minor preferences or temporary information
- 4-6: Useful context and moderate preferences
- 7-8: Important personal/professional facts
- 9-10: Critical identity or life-changing information

Only extract genuinely useful information. Skip generic responses or temporary states.

You MUST respond with a valid JSON object in this exact format:
{
  "memories": [
    {
      "content": "string describing the memory",
      "category": "personal" | "professional" | "preferences" | "knowledge" | "other",
      "importance": number between 1 and 10,
      "reasoning": "string explaining why this is important to remember"
    }
  ]
}`
        }
      ],
      model: modelId,
      temperature: 0.3
    });

    if (!response || typeof response === "string") {
      console.error("[Memory] Invalid response format:", response);
      return { success: false, error: "Invalid response format" };
    }

    try {
      let parsedResponse;
      if (typeof response === "object" && "content" in response) {
        const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
        const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
        parsedResponse = JSON.parse(cleanedContent);
      } else {
        parsedResponse = response;
      }

      const result = MemorySchema.safeParse(parsedResponse);
      if (!result.success) {
        return { success: true, memoriesStored: 0 };
      }

      const memories = result.data.memories;
      console.log("Memories:", memories);

      const existingMemories = await prisma.globalMemory.findMany({
        where: { userId, isDeleted: false },
        select: { content: true }
      });

      const existingContents = new Set(existingMemories.map((m) => m.content.toLowerCase().trim()));

      const newMemories = memories.filter((memory) => !existingContents.has(memory.content.toLowerCase().trim()));

      if (newMemories.length === 0) {
        return { success: true, memoriesStored: 0 };
      }

      await prisma.globalMemory.createMany({
        data: newMemories.map((memory) => ({
          userId,
          content: memory.content,
          category: memory.category,
          importance: memory.importance,
          reasoning: memory.reasoning
        }))
      });

      return {
        success: true,
        memoriesStored: newMemories.length,
        memories: newMemories
      };
    } catch (error) {
      console.error("[Memory] Error parsing response:", error);
      return { success: false, error: "Failed to parse response" };
    }
  } catch (error) {
    console.error("[Memory] Error analyzing memories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
