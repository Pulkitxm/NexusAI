"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

import { ModelSelector } from "@/chat/model-switcher";
import { getAvailableModels } from "@/data/models";
import { getStoredValue, setStoredValue } from "@/lib/utils";
import { useKeys } from "@/providers/use-keys";

interface ModelContextType {
  selectedModel: string;
  changeModel: (model: string) => void;
  ModelSwitcher: (() => React.ReactNode) | null;
  setSelectedModel: (model: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  toggleModal: () => void;
  closeModal: () => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const { keys, hasAnyKeys } = useKeys();
  const [selectedModel, setSelectedModel] = useState("");
  const availableModels = getAvailableModels(keys);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const changeModel = useCallback((model: string) => {
    setSelectedModel(model);
    setStoredValue("selectedModel", model);
  }, []);

  useEffect(() => {
    if (availableModels.length === 0) return;

    const storedModel = getStoredValue("selectedModel", "");
    const modelExists = availableModels.find((model) => model.id === storedModel);

    if (storedModel && modelExists) {
      changeModel(storedModel);
    } else {
      changeModel(availableModels[0].id);
    }
  }, [availableModels, changeModel]);

  const ModelSwitcherComponent = useCallback(
    () => <ModelSelector availableModels={availableModels} selectedModel={selectedModel} onModelChange={changeModel} />,
    [availableModels, selectedModel, changeModel]
  );

  useEffect(() => {
    if (!hasAnyKeys) setSelectedModel("");
  }, [hasAnyKeys]);

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        changeModel,
        ModelSwitcher: ModelSwitcherComponent,
        setSelectedModel,
        isModalOpen,
        setIsModalOpen,
        toggleModal: () => setIsModalOpen((prev) => !prev),
        closeModal: () => setIsModalOpen(false)
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
