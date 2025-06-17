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
  { value: "poppins", label: "Poppins", className: "font-poppins" },
  { value: "montserrat", label: "Montserrat", className: "font-montserrat" },
  { value: "raleway", label: "Raleway", className: "font-raleway" },
  { value: "nunito", label: "Nunito", className: "font-nunito" },
  { value: "source-sans-pro", label: "Source Sans Pro", className: "font-source-sans-pro" },
  { value: "merriweather", label: "Merriweather", className: "font-merriweather" },
  { value: "oswald", label: "Oswald", className: "font-oswald" },
  { value: "playfair-display", label: "Playfair Display", className: "font-playfair-display" },
  { value: "ubuntu", label: "Ubuntu", className: "font-ubuntu" },
  { value: "rubik", label: "Rubik", className: "font-rubik" },
  { value: "quicksand", label: "Quicksand", className: "font-quicksand" },
  { value: "cabin", label: "Cabin", className: "font-cabin" },
  { value: "josefin-sans", label: "Josefin Sans", className: "font-josefin-sans" },
  { value: "dancing-script", label: "Dancing Script", className: "font-dancing-script" },
  { value: "comfortaa", label: "Comfortaa", className: "font-comfortaa" }
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
              <SelectContent className="max-h-[250px]">
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
