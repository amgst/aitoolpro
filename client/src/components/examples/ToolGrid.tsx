import ToolGrid from "../ToolGrid";
import type { Tool } from "@shared/schema";

export default function ToolGridExample() {
  const mockTools: Tool[] = [
    {
      id: "1",
      slug: "chatgpt",
      name: "ChatGPT",
      description: "AI language model for various tasks",
      shortDescription: "AI assistant for writing, coding, and creative tasks",
      category: "Content Creation",
      pricing: "Freemium",
      websiteUrl: "https://chat.openai.com",
      features: ["Natural language understanding", "Code generation"],
      tags: ["AI", "Writing"],
      rating: 4.8,
      lastUpdated: "2024-01-15"
    },
    {
      id: "2",
      slug: "midjourney",
      name: "Midjourney",
      description: "AI image generation tool",
      shortDescription: "Create stunning AI-generated images from text",
      category: "Image Generation",
      pricing: "Paid",
      websiteUrl: "https://midjourney.com",
      features: ["Text-to-image generation", "High-quality outputs"],
      tags: ["AI", "Images"],
      badge: "Trending",
      rating: 4.9,
      lastUpdated: "2024-01-14"
    }
  ];

  return <ToolGrid tools={mockTools} />;
}
