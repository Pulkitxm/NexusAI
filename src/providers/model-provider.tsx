"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useKeys } from "@/providers/key-provider";
import { getAvailableModels } from "@/lib/models";
import { ModelSelector } from "@/components/ModelSwitcher";

interface ModelContextType {
  selectedModel: string;
  changeModel: (model: string) => void;
  ModelSwitcher: () => React.ReactNode;
  setSelectedModel: (model: string) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const { keys } = useKeys();
  const [selectedModel, setSelectedModel] = useState("");
  const availableModels = getAvailableModels(keys);

  const changeModel = useCallback((model: string) => {
    setSelectedModel(model);
    localStorage.setItem("selectedModel", model);
  }, []);

  useEffect(() => {
    if (availableModels.length === 0) return;

    const storedModel = localStorage.getItem("selectedModel");
    const modelExists = availableModels.find(
      (model) => model.id === storedModel,
    );

    if (storedModel && modelExists) {
      changeModel(storedModel);
    } else {
      changeModel(availableModels[0].id);
    }
  }, [availableModels, changeModel]);

  const ModelSwitcherComponent = useCallback(
    () => (
      <ModelSelector
        availableModels={availableModels}
        selectedModel={selectedModel}
        onModelChange={changeModel}
      />
    ),
    [availableModels, selectedModel, changeModel],
  );

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        changeModel,
        ModelSwitcher: ModelSwitcherComponent,
        setSelectedModel,
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
