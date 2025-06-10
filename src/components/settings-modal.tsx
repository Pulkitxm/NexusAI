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
  Lock,
  DollarSign,
  RefreshCw,
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
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[75vw] max-w-3xl h-[90vh] sm:h-[85vh] overflow-hidden p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <Settings className="w-4 h-4" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="keys" className="w-full flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 bg-gray-100 dark:bg-gray-800/60">
            <TabsTrigger value="keys" className="text-sm">
              <Key className="w-3.5 h-3.5 mr-1.5" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="about" className="text-sm">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              About BYOK
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden px-4 pt-3">
            <TabsContent value="keys" className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[500px] lg:max-h-[600px]">
                {keyConfigs.map((config) => (
                  <Card
                    key={config.key}
                    className="border border-gray-200 dark:border-gray-800 shadow-sm"
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 ${config.color} rounded-md flex items-center justify-center flex-shrink-0`}
                          >
                            <config.icon className="text-white text-lg" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">
                              {config.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {config.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-10 sm:ml-0">
                          {tempKeys[config.key as keyof typeof tempKeys] && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs h-6 px-2"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2 border-gray-200 dark:border-gray-700"
                            onClick={() => window.open(config.link, "_blank")}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Get Key
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0">
                      <div className="space-y-1">
                        <Label
                          htmlFor={config.key}
                          className="text-xs font-normal text-gray-600 dark:text-gray-400"
                        >
                          API Key
                        </Label>
                        <div className="relative">
                          <Input
                            id={config.key}
                            type={showKeys[config.key] ? "text" : "password"}
                            placeholder={`${config.name} API key`}
                            value={
                              tempKeys[config.key as keyof typeof tempKeys] ||
                              ""
                            }
                            onChange={(e) =>
                              setTempKeys((prev) => ({
                                ...prev,
                                [config.key]: e.target.value,
                              }))
                            }
                            className="pr-9 h-9 text-sm bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-2.5 rounded-l-none text-gray-500"
                            onClick={() => toggleKeyVisibility(config.key)}
                          >
                            {showKeys[config.key] ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2 py-4 mt-auto">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-9 text-sm border-gray-200 dark:border-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="h-9 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save Keys
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="about" className="h-full overflow-y-auto">
              <Card className="border-gray-200 dark:border-gray-800 mb-4">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    Bring Your Own Key
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Privacy and security by design
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Lock className="text-emerald-600 dark:text-emerald-400 w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Your Keys, Your Control
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Keys stored locally, never sent to our servers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Shield className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Direct Communication
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Requests go directly to AI providers - we never see
                          your data
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                      <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <DollarSign className="text-violet-600 dark:text-violet-400 w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Pay Only What You Use
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          No subscription fees - pay providers directly based on
                          usage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <RefreshCw className="text-amber-600 dark:text-amber-400 w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Sync Across Devices
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Sign in to sync your chat history across all devices
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
