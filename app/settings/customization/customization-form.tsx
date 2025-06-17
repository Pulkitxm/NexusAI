"use client";

import { UseFormReturn } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFont } from "@/providers/use-font";

type FormValues = {
  jobTitle?: string;
  occupation?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  customFont?: string;
  theme: "light" | "dark";
};

const FONT_OPTIONS = [
  { value: "inter", label: "Inter", className: "font-inter" },
  { value: "roboto", label: "Roboto", className: "font-roboto" },
  { value: "open-sans", label: "Open Sans", className: "font-open-sans" },
  { value: "lato", label: "Lato", className: "font-lato" },
  { value: "poppins", label: "Poppins", className: "font-poppins" }
];

interface CustomizationSettingsFormProps {
  form: UseFormReturn<FormValues>;
}

export function CustomizationSettingsForm({ form }: CustomizationSettingsFormProps) {
  const { setCurrentFont } = useFont();

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Theme</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Choose your preferred color scheme.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="customFont"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Font</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setCurrentFont(value);
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value} className={font.className}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Choose your preferred font for the application.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
