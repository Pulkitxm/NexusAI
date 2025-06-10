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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    if (
      storedModel &&
      availableModels.find((model) => model.id === storedModel)
    ) {
      changeModel(storedModel);
    }
  }, [availableModels, changeModel]);

  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      changeModel(availableModels[0].id);
    }
  }, [availableModels, selectedModel, changeModel]);

  useEffect(() => {
    if (
      availableModels.length > 0 &&
      !availableModels.find((model) => model.id === selectedModel)
    ) {
      changeModel(availableModels[0].id);
    }
  }, [availableModels, selectedModel, changeModel]);

  function ModelSwitcher() {
    return (
      <Select value={selectedModel} onValueChange={changeModel}>
        <SelectTrigger className="w-[180px] sm:w-[220px] text-sm h-9 border-gray-200 dark:border-gray-700">
          <SelectValue placeholder="Select AI Model" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {availableModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center gap-2 py-1">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center`}
                >
                  <model.icon className="text-xs" />
                </div>
                <div className="text-sm">{model.name}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <ModelContext.Provider
      value={{ selectedModel, changeModel, ModelSwitcher, setSelectedModel }}
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
