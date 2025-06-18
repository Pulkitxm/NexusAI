"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getChats, getChatMessages, deleteChat, updateChatTitle as updateChatTitleAction } from "@/actions/chat";
import { createChatWithTitle, saveUserMessage, saveAssistantMessage } from "@/actions/chat";

import type { Chat } from "@/types/chat";

// Query keys
export const chatKeys = {
  all: ["chats"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  list: (filters: string) => [...chatKeys.lists(), { filters }] as const,
  details: () => [...chatKeys.all, "detail"] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
  messages: (chatId: string) => [...chatKeys.detail(chatId), "messages"] as const
};

// Hook for fetching chat list
export function useChats() {
  return useQuery({
    queryKey: chatKeys.lists(),
    queryFn: async () => {
      const response = await getChats();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch chats");
      }
      return response.chats || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5 // 5 minutes
  });
}

// Hook for fetching chat messages
export function useChatMessages(chatId: string | null, share?: boolean) {
  return useQuery({
    queryKey: chatKeys.messages(chatId || ""),
    queryFn: async () => {
      if (!chatId) return [];
      const response = await getChatMessages({ chatId, share });
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch chat messages");
      }
      return response.messages || [];
    },
    enabled: !!chatId,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes
  });
}

// Hook for creating a new chat
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      currentInput,
      apiKey,
      openRouter,
      modelUUId,
      attachments
    }: {
      currentInput: string;
      apiKey: string;
      openRouter?: boolean;
      modelUUId: string;
      attachments?: { id: string }[];
    }) => {
      const response = await createChatWithTitle({
        currentInput,
        apiKey,
        openRouter,
        modelUUId,
        attachments
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to create chat");
      }
      return response.chat;
    },
    onSuccess: (newChat) => {
      // Invalidate and refetch chat list
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });

      // Add the new chat to the cache
      queryClient.setQueryData(chatKeys.lists(), (oldData: Chat[] | undefined) => {
        if (!oldData) return [newChat];
        return [newChat, ...oldData];
      });
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  });
}

// Hook for saving user message
export function useSaveUserMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      content,
      attachments
    }: {
      chatId: string;
      content: string;
      attachments?: { id: string }[];
    }) => {
      const response = await saveUserMessage({
        chatId,
        content,
        attachments
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to save user message");
      }
      return response.message;
    },
    onSuccess: (message, variables) => {
      // Invalidate chat messages to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.chatId) });

      // Invalidate chat list to update last modified time
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
    onError: (error) => {
      console.error("Error saving user message:", error);
      toast.error("Failed to save message");
    }
  });
}

// Hook for saving assistant message
export function useSaveAssistantMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, content, modelUsed }: { chatId: string; content: string; modelUsed: string }) => {
      const response = await saveAssistantMessage({
        chatId,
        content,
        modelUsed
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to save assistant message");
      }
      return response.message;
    },
    onSuccess: (message, variables) => {
      // Invalidate chat messages to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.chatId) });

      // Invalidate chat list to update last modified time
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
    onError: (error) => {
      console.error("Error saving assistant message:", error);
      toast.error("Failed to save assistant message");
    }
  });
}

// Hook for deleting a chat
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId }: { chatId: string }) => {
      const response = await deleteChat({ chatId });
      if (!response.success) {
        throw new Error(response.error || "Failed to delete chat");
      }
      return response.chat;
    },
    onSuccess: (deletedChat) => {
      if (!deletedChat) return;

      // Remove from chat list cache
      queryClient.setQueryData(chatKeys.lists(), (oldData: Chat[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter((chat) => chat.id !== deletedChat.id);
      });

      // Remove chat messages from cache
      queryClient.removeQueries({ queryKey: chatKeys.messages(deletedChat.id) });

      // Remove chat detail from cache
      queryClient.removeQueries({ queryKey: chatKeys.detail(deletedChat.id) });
    },
    onError: (error) => {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  });
}

// Hook for updating chat title
export function useUpdateChatTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
      const response = await updateChatTitleAction({ chatId, title });
      if (!response.success) {
        throw new Error(response.error || "Failed to update chat title");
      }
      return response.chat;
    },
    onSuccess: (updatedChat) => {
      if (!updatedChat) return;

      // Update chat in list cache
      queryClient.setQueryData(chatKeys.lists(), (oldData: Chat[] | undefined) => {
        if (!oldData) return [updatedChat];
        return oldData.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat));
      });
    },
    onError: (error) => {
      console.error("Error updating chat title:", error);
      toast.error("Failed to update chat title");
    }
  });
}

// Hook for prefetching chat messages
export function usePrefetchChatMessages() {
  const queryClient = useQueryClient();

  return (chatId: string) => {
    queryClient.prefetchQuery({
      queryKey: chatKeys.messages(chatId),
      queryFn: async () => {
        const response = await getChatMessages({ chatId });
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch chat messages");
        }
        return response.messages || [];
      },
      staleTime: 1000 * 60 * 3 // 3 minutes
    });
  };
}
