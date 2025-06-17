"use client";

import { Eye, EyeOff, ExternalLink, Shield, Settings, Zap, Lock, DollarSign, RefreshCw, ArrowLeft } from "lucide-react";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { keyConfigs } from "@/data/models";
import { useKeys } from "@/providers/use-keys";

interface SettingsModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const SettingsModalContext = createContext<SettingsModalContextType | undefined>(undefined);

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <SettingsModalContext.Provider value={{ isOpen, openModal, closeModal }}>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 border-b px-4 pt-4 pb-4 sm:px-6 sm:pt-6">
          <DialogTitle className="flex items-center gap-2">
            {view === "about" && (
              <Button variant="ghost" size="sm" className="mr-2 -ml-2" onClick={() => setView("keys")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Settings className="h-5 w-5" />
            {view === "keys" ? "Settings" : "About BYOK"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {view === "keys" ? (
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-4 p-4 sm:p-6">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setView("about")}>
                    <Shield className="mr-2 h-4 w-4" />
                    About BYOK
                  </Button>
                </div>

                <div className="space-y-4">
                  {keyConfigs.map((config) => (
                    <Card key={config.key}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                              <config.icon className="text-muted-foreground h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base font-medium">{config.name}</CardTitle>
                              <CardDescription className="mt-1 text-sm">{config.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {tempKeys[config.key as keyof typeof tempKeys] && (
                              <Badge variant="secondary" className="gap-1">
                                <Zap className="h-3 w-3" />
                                Active
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
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
                          <Label htmlFor={config.key} className="text-sm">
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
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                              onClick={() => toggleKeyVisibility(config.key)}
                            >
                              {showKeys[config.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="bg-background mt-auto border-t px-4 py-4 sm:px-6">
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Keys</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 sm:p-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Bring Your Own Key (BYOK)
                  </CardTitle>
                  <CardDescription>Complete privacy and control over your AI interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="bg-card flex items-start gap-3 rounded-lg border p-4">
                      <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                        <Lock className="text-muted-foreground h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium">Your Keys, Your Control</h4>
                        <p className="text-muted-foreground mt-1 text-sm">
                          API keys are stored locally in your browser and never sent to our servers
                        </p>
                      </div>
                    </div>

                    <div className="bg-card flex items-start gap-3 rounded-lg border p-4">
                      <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                        <Shield className="text-muted-foreground h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium">Direct Communication</h4>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Your requests go directly to AI providers - we never see your data or conversations
                        </p>
                      </div>
                    </div>

                    <div className="bg-card flex items-start gap-3 rounded-lg border p-4">
                      <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                        <DollarSign className="text-muted-foreground h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium">Pay Only What You Use</h4>
                        <p className="text-muted-foreground mt-1 text-sm">
                          No subscription fees - pay AI providers directly based on your actual usage
                        </p>
                      </div>
                    </div>

                    <div className="bg-card flex items-start gap-3 rounded-lg border p-4">
                      <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                        <RefreshCw className="text-muted-foreground h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium">Sync Across Devices</h4>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Sign in to sync your chat history and settings across all your devices
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-muted-foreground list-inside list-decimal space-y-2 text-sm">
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
      </DialogContent>
    </Dialog>
  );
}
