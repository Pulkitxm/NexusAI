"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKeys } from "@/providers/key-provider";
import {
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Settings,
  Zap,
  Lock,
  DollarSign,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { keyConfigs } from "@/lib/models";

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
      <DialogContent className="max-w-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {view === "about" && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 -ml-2"
                onClick={() => setView("keys")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Settings className="w-5 h-5" />
            {view === "keys" ? "Settings" : "About BYOK"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {view === "keys" ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 sm:p-6 space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setView("about")}>
                    <Shield className="w-4 h-4 mr-2" />
                    About BYOK
                  </Button>
                </div>

                <div className="space-y-4">
                  {keyConfigs.map((config) => (
                    <Card key={config.key}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                              <config.icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base font-medium">
                                {config.name}
                              </CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {config.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {tempKeys[config.key as keyof typeof tempKeys] && (
                              <Badge variant="secondary" className="gap-1">
                                <Zap className="w-3 h-3" />
                                Active
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => window.open(config.link, "_blank")}
                            >
                              <ExternalLink className="w-3 h-3" />
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
                              value={
                                tempKeys[config.key as keyof typeof tempKeys] || ""
                              }
                              onChange={(e) =>
                                setTempKeys((prev) => ({
                                  ...prev,
                                  [config.key]: e.target.value,
                                }))
                              }
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => toggleKeyVisibility(config.key)}
                            >
                              {showKeys[config.key] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="mt-auto px-4 sm:px-6 py-4 border-t bg-background">
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Keys</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Bring Your Own Key (BYOK)
                  </CardTitle>
                  <CardDescription>
                    Complete privacy and control over your AI interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium">Your Keys, Your Control</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          API keys are stored locally in your browser and never sent
                          to our servers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium">Direct Communication</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your requests go directly to AI providers - we never see
                          your data or conversations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium">Pay Only What You Use</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          No subscription fees - pay AI providers directly based on
                          your actual usage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium">Sync Across Devices</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sign in to sync your chat history and settings across all
                          your devices
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
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Click &quot;Get Key&quot; next to any AI provider to create an account
                      and obtain your API key
                    </li>
                    <li>Paste your API key into the corresponding field above</li>
                    <li>
                      Click &quot;Save Keys&quot; to store them securely in your browser
                    </li>
                    <li>
                      Start chatting with your preferred AI models immediately
                    </li>
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