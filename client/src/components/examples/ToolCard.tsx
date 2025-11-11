import ToolCard from "../ToolCard";
import type { Tool } from "@shared/schema";

export default function ToolCardExample() {
  const mockTool: Tool = {
    id: "1",
    slug: "chatgpt",
    name: "ChatGPT",
    description: "ChatGPT is an AI language model that can help with writing, coding, analysis, and more.",
    shortDescription: "AI assistant for writing, coding, and creative tasks",
    category: "Content Creation",
    pricing: "Freemium",
    websiteUrl: "https://chat.openai.com",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    features: [
      "Natural language understanding",
      "Code generation and debugging",
      "Content writing and editing"
    ],
    tags: ["AI", "Writing", "Coding"],
    badge: "Popular",
    rating: 4.8,
    lastUpdated: "2024-01-15"
  };

  return (
    <div className="max-w-sm">
      <ToolCard tool={mockTool} />
    </div>
  );
}
