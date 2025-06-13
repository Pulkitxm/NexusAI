// lib/memoryAnalyzer.ts
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AI_MODELS } from "@/lib/models";

const MemorySchema = z.object({
  memories: z.array(
    z.object({
      content: z.string().min(1),
      category: z.enum([
        "personal",
        "professional", 
        "preferences",
        "knowledge",
        "other"
      ]),
      importance: z.number().min(1).max(10),
      reasoning: z.string().min(1),
    })
  ),
});

export async function analyzeAndStoreMemories(
  userId: string,
  userMessage: string,
  assistantResponse: string,
  apiKey: string,
  modelId: string
) {
  try {
    // Find the model configuration
    const modelConfig = AI_MODELS.find((m) => m.id === modelId);
    if (!modelConfig) {
      console.error(`[Memory] Model "${modelId}" not found`);
      return { success: false, error: "Model not found" };
    }

    // Create the appropriate AI model instance
    let aiModel;
    const provider = modelConfig.provider;

    try {
      switch (provider) {
        case "OpenAI":
          const openai = createOpenAI({ apiKey });
          // Use a more efficient model for memory analysis if available
          const analysisModel = modelId.includes("gpt-4o") ? "gpt-4o-mini" : modelId;
          aiModel = openai(analysisModel);
          break;

        case "Anthropic":
          const anthropic = createAnthropic({ apiKey });
          // Use the same model for Anthropic
          aiModel = anthropic(modelId);
          break;

        case "Google":
          const google = createGoogleGenerativeAI({ apiKey });
          aiModel = google(modelId);
          break;

        default:
          console.error(`[Memory] Provider "${provider}" not supported for memory analysis`);
          return { success: false, error: "Provider not supported" };
      }
    } catch (error) {
      console.error("[Memory] Error initializing AI provider:", error);
      return { success: false, error: "Failed to initialize AI provider" };
    }
    
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
      temperature: 0.3,
    });

    if (result.object.memories.length === 0) {
      return { success: true, memoriesStored: 0 };
    }

    // Check for duplicates and store new memories
    const existingMemories = await prisma.globalMemory.findMany({
      where: { userId, isDeleted: false },
      select: { content: true },
    });

    const existingContents = new Set(
      existingMemories.map(m => m.content.toLowerCase().trim())
    );

    const newMemories = result.object.memories.filter(memory => 
      !existingContents.has(memory.content.toLowerCase().trim())
    );

    if (newMemories.length === 0) {
      return { success: true, memoriesStored: 0 };
    }

    await prisma.globalMemory.createMany({
      data: newMemories.map(memory => ({
        userId,
        content: memory.content,
        category: memory.category,
        importance: memory.importance,
        reasoning: memory.reasoning,
      })),
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