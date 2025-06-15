import { Sparkles, Compass, GraduationCap, Code, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export const MESSAGE_LIMIT = 10;

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export const SUGGESTED_PROMPTS: {
  section: "Create" | "Explore" | "Code" | "Learn";
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  prompts: string[];
}[] = [
  {
    section: "Create",
    icon: Sparkles,
    prompts: [
      "Write a short story about a robot discovering emotions",
      "Help me outline a sci-fi novel set in a post-apocalyptic world",
      "Create a character profile for a complex villain with sympathetic motives",
      "Give me 5 creative writing prompts for flash fiction"
    ]
  },
  {
    section: "Explore",
    icon: Compass,
    prompts: [
      "Good books for fans of Rick Rubin",
      "Countries ranked by number of corgis",
      "Most successful companies in the world",
      "How much does Claude cost?"
    ]
  },
  {
    section: "Code",
    icon: Code,
    prompts: [
      "Write code to invert a binary search tree in Python",
      "What's the difference between Promise.all and Promise.allSettled?",
      "Explain React's useEffect cleanup function",
      "Best practices for error handling in async/await"
    ]
  },
  {
    section: "Learn",
    icon: GraduationCap,
    prompts: [
      "Beginner's guide to TypeScript",
      "Explain the CAP theorem in distributed systems",
      "Why is AI so expensive?",
      "Are black holes real?"
    ]
  }
];
