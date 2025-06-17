"use client";

import { Eye, EyeOff, ExternalLink, Shield, Settings, Zap, Lock, DollarSign, RefreshCw, ArrowLeft } from "lucide-react";
import { createContext, useContext, useState, type ReactNode, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { keyConfigs } from "@/data/models";
import { useKeys } from "@/providers/use-keys";

interface SettingsModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

const SettingsModalContext = createContext<SettingsModalContextType | undefined>(undefined);

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <SettingsModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        toggleModal: () => setIsOpen((prev) => !prev)
      }}
    >
      {children}
      <SettingsModal open={isOpen} onOpenChange={setIsOpen} />
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const context = useContext(SettingsModalContext);
  if (context === undefined) {
    throw new Error("useSettingsModal must be used within a SettingsModalProvider");
  }
  return context;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { keys, updateKeys } = useKeys();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState(keys);
  const [view, setView] = useState<"keys" | "about">("keys");

  useEffect(() => {
    setTempKeys(keys);
  }, [keys]);

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleSave = () => {
    updateKeys(tempKeys);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempKeys(keys);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[98vw] max-w-4xl flex-col overflow-hidden border-slate-200 bg-slate-50 p-0 sm:max-w-2xl lg:max-w-4xl dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader className="flex-shrink-0 border-b border-slate-200 bg-white px-4 pt-4 pb-4 sm:px-6 sm:pt-6 dark:border-slate-700 dark:bg-slate-800">
          <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            {view === "about" && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setView("keys")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Settings className="h-5 w-5" />
            {view === "keys" ? "Settings" : "About BYOK"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          {view === "keys" ? (
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-4 p-4 sm:p-6">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    onClick={() => setView("about")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    About BYOK
                  </Button>
                </div>

                <div className="space-y-4">
                  {keyConfigs.map((config) => (
                    <Card
                      className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                      key={config.key}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                              <config.icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base font-medium text-slate-900 dark:text-slate-100">
                                {config.name}
                              </CardTitle>
                              <CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {config.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {tempKeys[config.key as keyof typeof tempKeys] && (
                              <Badge
                                variant="outline"
                                className="gap-1 border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              >
                                <Zap className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                Active
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                              onClick={() => window.open(config.link, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Get Key
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <Label htmlFor={config.key} className="text-sm text-slate-700 dark:text-slate-300">
                            API Key
                          </Label>
                          <div className="relative">
                            <Input
                              id={config.key}
                              type={showKeys[config.key] ? "text" : "password"}
                              placeholder={`Enter your ${config.name} API key`}
                              value={tempKeys[config.key as keyof typeof tempKeys] || ""}
                              onChange={(e) =>
                                setTempKeys((prev) => ({
                                  ...prev,
                                  [config.key]: e.target.value
                                }))
                              }
                              className="border-slate-300 bg-white pr-10 text-slate-900 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                              onClick={() => toggleKeyVisibility(config.key)}
                            >
                              {showKeys[config.key] ? (
                                <EyeOff className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 sm:p-6">
              <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                    <Shield className="h-5 w-5" />
                    Bring Your Own Key (BYOK)
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Complete privacy and control over your AI interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/50">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                        <Lock className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Your Keys, Your Control</h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          API keys are stored locally in your browser and never sent to our servers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/50">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                        <Shield className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Direct Communication</h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          Your requests go directly to AI providers - we never see your data or conversations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/50">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                        <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Pay Only What You Use</h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          No subscription fees - pay AI providers directly based on your actual usage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/50">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                        <RefreshCw className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Sync Across Devices</h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          Sign in to sync your chat history and settings across all your devices
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-slate-100">Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li>
                      Click &quot;Get Key&quot; next to any AI provider to create an account and obtain your API key
                    </li>
                    <li>Paste your API key into the corresponding field above</li>
                    <li>Click &quot;Save Keys&quot; to store them securely in your browser</li>
                    <li>Start chatting with your preferred AI models immediately</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {view === "keys" && (
          <DialogFooter className="flex-shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex w-full justify-end gap-3">
              <Button
                variant="outline"
                className="border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Save Keys
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
