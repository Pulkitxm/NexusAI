"use client";

import { TriangleAlert, FileX, RefreshCw, Home, ArrowLeft, Loader2, CheckCircle, Search, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { ReactNode } from "react";

type StateType = "error" | "not-found" | "empty" | "loading" | "success";

interface ActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "ghost";
  icon?: ReactNode;
}

interface StateDisplayProps {
  type: StateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ActionButton[];
  showDefaultActions?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const defaultConfigs = {
  error: {
    icon: TriangleAlert,
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
    iconColor: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    defaultActions: [
      { label: "Try Again", icon: <RefreshCw className="mr-2 h-4 w-4" />, variant: "default" as const },
      { label: "Go Home", href: "/", icon: <Home className="mr-2 h-4 w-4" />, variant: "outline" as const }
    ]
  },
  "not-found": {
    icon: FileX,
    title: "Not Found",
    description: "The page or resource you're looking for doesn't exist.",
    iconColor: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    defaultActions: [
      {
        label: "Go Back",
        onClick: () => window.history.back(),
        icon: <ArrowLeft className="mr-2 h-4 w-4" />,
        variant: "outline" as const
      },
      { label: "Go Home", href: "/", icon: <Home className="mr-2 h-4 w-4" />, variant: "default" as const }
    ]
  },
  empty: {
    icon: Search,
    title: "No items found",
    description: "There's nothing to show here yet.",
    iconColor: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-muted",
    defaultActions: [{ label: "Create New", icon: <Plus className="mr-2 h-4 w-4" />, variant: "default" as const }]
  },
  loading: {
    icon: Loader2,
    title: "Loading...",
    description: "Please wait while we fetch your data.",
    iconColor: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    defaultActions: []
  },
  success: {
    icon: CheckCircle,
    title: "Success!",
    description: "Your action was completed successfully.",
    iconColor: "text-green-500 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    defaultActions: [{ label: "Continue", href: "/", variant: "default" as const }]
  }
};

const sizeConfigs = {
  sm: {
    container: "min-h-[200px]",
    iconContainer: "h-12 w-12",
    iconSize: "h-6 w-6",
    title: "text-lg",
    description: "text-sm",
    maxWidth: "max-w-sm"
  },
  md: {
    container: "min-h-[400px]",
    iconContainer: "h-16 w-16",
    iconSize: "h-8 w-8",
    title: "text-xl",
    description: "text-sm",
    maxWidth: "max-w-md"
  },
  lg: {
    container: "min-h-[500px]",
    iconContainer: "h-20 w-20",
    iconSize: "h-10 w-10",
    title: "text-2xl",
    description: "text-base",
    maxWidth: "max-w-lg"
  }
};

export default function StateDisplay({
  type,
  title,
  description,
  icon,
  actions,
  showDefaultActions = true,
  className = "",
  size = "md"
}: StateDisplayProps) {
  const config = defaultConfigs[type];
  const sizeConfig = sizeConfigs[size];

  const Icon = icon ? () => icon : config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActions = (actions || (showDefaultActions ? config.defaultActions : [])) as ActionButton[];

  const isAnimated = type === "loading";

  return (
    <div className={`flex ${sizeConfig.container} items-center justify-center p-4 ${className}`}>
      <div className="text-center">
        <div
          className={`mx-auto mb-4 flex ${sizeConfig.iconContainer} items-center justify-center rounded-full ${config.bgColor} ${config.borderColor} border-2`}
        >
          <Icon className={`${sizeConfig.iconSize} ${config.iconColor} ${isAnimated ? "animate-spin" : ""}`} />
        </div>

        <h2 className={`mb-2 ${sizeConfig.title} font-semibold text-foreground`}>{displayTitle}</h2>

        <p className={`mb-6 ${sizeConfig.maxWidth} ${sizeConfig.description} text-muted-foreground`}>
          {displayDescription}
        </p>

        {displayActions.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {displayActions.map((action, index) => {
              if (action.href) {
                return (
                  <Button key={index} asChild variant={action.variant || "outline"} size="sm">
                    <Link href={action.href}>
                      {action.icon}
                      {action.label}
                    </Link>
                  </Button>
                );
              }
              return (
                <Button key={index} onClick={action.onClick} variant={action.variant || "outline"} size="sm">
                  {action.icon}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
