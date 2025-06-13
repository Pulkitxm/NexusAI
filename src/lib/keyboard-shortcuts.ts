export interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: "navigation" | "messaging";
}

export const keyboardShortcuts: KeyboardShortcut[] = [
  {
    keys: ["/"],
    description: "Focus message input",
    category: "navigation",
  },
  {
    keys: ["Cmd", "/"],
    description: "Toggle shortcuts dialog",
    category: "navigation",
  },
  {
    keys: ["Cmd", "b"],
    description: "Toggle open sidebar",
    category: "navigation",
  },
  {
    keys: ["Esc"],
    description: "Clear input or close dialog",
    category: "navigation",
  },
  {
    keys: ["Enter"],
    description: "Send message",
    category: "messaging",
  },
  {
    keys: ["Shift", "Enter"],
    description: "Add new line",
    category: "messaging",
  },
  {
    keys: ["Cmd", "Enter"],
    description: "Save edited message",
    category: "messaging",
  },
  {
    keys: ["Cmd", "Shift", "m"],
    description: "Mute/Unmute microphone",
    category: "messaging",
  },
];
