import { generateObject } from "ai";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { AI_MODELS } from "@/lib/models";

import { getAiProvider } from "../../lib/ai-helper";

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

export async function analyzeAndStoreMemories({
  apiKey,
  assistantResponse,
  modelId,
  userId,
  userMessage,
  openRouter
}: {
  userId: string;
  userMessage: string;
  assistantResponse: string;
  apiKey: string;
  modelId: string;
  openRouter: boolean;
}) {
  try {
    const modelConfig = AI_MODELS.find((m) => m.id === modelId);
    if (!modelConfig) {
      console.error(`[Memory] Model "${modelId}" not found`);
      return { success: false, error: "Model not found" };
    }

    const provider = modelConfig.provider;
    const aiModelResult = getAiProvider({
      apiKey,
      finalModel: modelId,
      modelProvider: provider,
      openRouter
    });

    if (!aiModelResult.success) {
      console.error("[Memory] Error initializing AI provider:", aiModelResult.error);
      return { success: false, error: aiModelResult.error };
    }

    const aiModel = aiModelResult.aiModel;

    const result = await generateObject({
      model: aiModel,
      schema: MemorySchema,
      prompt: `Analyze this conversation and extract important information that should be remembered about the user for future conversations.

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

Only extract genuinely useful information. Skip generic responses or temporary states.`,
      temperature: 0.3
    });

    if (result.object.memories.length === 0) {
      return { success: true, memoriesStored: 0 };
    }

    const existingMemories = await prisma.globalMemory.findMany({
      where: { userId, isDeleted: false },
      select: { content: true }
    });

    const existingContents = new Set(existingMemories.map((m) => m.content.toLowerCase().trim()));

    const newMemories = result.object.memories.filter(
      (memory) => !existingContents.has(memory.content.toLowerCase().trim())
    );

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

    console.log(`[Memory] Stored ${newMemories.length} new memories for user ${userId}`);

    return {
      success: true,
      memoriesStored: newMemories.length,
      memories: newMemories
    };
  } catch (error) {
    console.error("[Memory] Error analyzing memories:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
