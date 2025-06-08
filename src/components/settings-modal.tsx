"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Key,
  Shield,
  Settings,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  RiRobotLine,
  RiBrainLine,
  RiGoogleFill,
  RiSpeedLine,
  RiSearchLine,
  RiFireLine,
  RiMapLine,
  RiShieldCheckLine,
  RiLockLine,
  RiMoneyDollarCircleLine,
  RiRefreshLine,
} from "react-icons/ri";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { keys, updateKeys } = useKeys();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState(keys);

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleSave = () => {
    updateKeys(tempKeys);
    onOpenChange(false);
  };

  const keyConfigs = [
    {
      key: "openai",
      name: "OpenAI",
      description: "Access GPT models, DALL-E, and more",
      icon: RiRobotLine,
      color: "bg-green-500",
      link: "https://platform.openai.com/api-keys",
    },
    {
      key: "anthropic",
      name: "Anthropic",
      description: "Access Claude models",
      icon: RiBrainLine,
      color: "bg-orange-500",
      link: "https://console.anthropic.com/settings/keys",
    },
    {
      key: "google",
      name: "Google AI",
      description: "Access Gemini models",
      icon: RiGoogleFill,
      color: "bg-blue-500",
      link: "https://aistudio.google.com/app/apikey",
    },
    {
      key: "groq",
      name: "Groq",
      description: "Fast inference for Llama and other models",
      icon: RiSpeedLine,
      color: "bg-purple-500",
      link: "https://console.groq.com/keys",
    },
    {
      key: "deepseek",
      name: "DeepSeek",
      description: "Access DeepSeek reasoning models",
      icon: RiSearchLine,
      color: "bg-red-500",
      link: "https://platform.deepseek.com/api_keys",
    },
    {
      key: "fireworks",
      name: "Fireworks AI",
      description: "High-performance model inference",
      icon: RiFireLine,
      color: "bg-yellow-500",
      link: "https://fireworks.ai/account/api-keys",
    },
    {
      key: "openrouter",
      name: "OpenRouter",
      description: "Access to multiple models via one API",
      icon: RiMapLine,
      color: "bg-indigo-500",
      link: "https://openrouter.ai/keys",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings & API Keys
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="keys" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              About BYOK
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            <div className="grid gap-4">
              {keyConfigs.map((config) => (
                <Card key={config.key} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center`}
                        >
                          <config.icon className="text-white text-lg" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {config.name}
                          </CardTitle>
                          <CardDescription>
                            {config.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tempKeys[config.key as keyof typeof tempKeys] && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(config.link, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Get Key
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor={config.key}>API Key</Label>
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
                          className="absolute right-0 top-0 h-full px-3"
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

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                Save Keys
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-5 h-5 text-green-600" />
                  Bring Your Own Key (BYOK)
                </CardTitle>
                <CardDescription>
                  Your privacy and security are our top priorities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <RiLockLine className="text-green-600 text-sm" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Your Keys, Your Control
                      </h4>
                      <p className="text-sm text-gray-600">
                        API keys are stored locally in your browser and never
                        sent to our servers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <RiShieldCheckLine className="text-blue-600 text-sm" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Direct API Communication
                      </h4>
                      <p className="text-sm text-gray-600">
                        Your requests go directly to AI providers using your
                        keys - we never see your data.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <RiMoneyDollarCircleLine className="text-purple-600 text-sm" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Pay Only for What You Use
                      </h4>
                      <p className="text-sm text-gray-600">
                        No subscription fees - you pay providers directly based
                        on your usage.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <RiRefreshLine className="text-orange-600 text-sm" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Sync Across Devices
                      </h4>
                      <p className="text-sm text-gray-600">
                        Sign in with Google to sync your chat history across all
                        your devices.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
