import ToolDetailView from "../ToolDetailView";
import type { Tool } from "@shared/schema";

export default function ToolDetailViewExample() {
  const mockTool: Tool = {
    id: "1",
    slug: "chatgpt",
    name: "ChatGPT",
    description: "ChatGPT is a state-of-the-art conversational AI developed by OpenAI. It uses advanced natural language processing to understand and respond to a wide range of queries, from creative writing to technical problem-solving. Whether you need help with coding, content creation, or just want to have an intelligent conversation, ChatGPT adapts to your needs.",
    shortDescription: "AI assistant for writing, coding, and creative tasks",
    category: "Content Creation",
    pricing: "Freemium",
    websiteUrl: "https://chat.openai.com",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    features: [
      "Natural language understanding and generation",
      "Code generation and debugging assistance",
      "Content writing and editing",
      "Research and summarization",
      "Multi-language support",
      "Context-aware conversations"
    ],
    tags: ["AI", "Writing", "Coding", "Productivity", "NLP"],
    badge: "Popular",
    rating: 4.8,
    developer: "OpenAI",
    documentationUrl: "https://platform.openai.com/docs",
    socialLinks: {
      twitter: "https://twitter.com/openai",
      github: "https://github.com/openai"
    },
    useCases: [
      "Draft emails and professional communications",
      "Debug and explain code snippets",
      "Generate creative content and ideas",
      "Research and summarize complex topics"
    ],
    pricingDetails: {
      free: "Limited access with standard response times",
      pro: "$20/month - Faster responses, GPT-4 access, priority support"
    },
    launchDate: "November 2022",
    lastUpdated: "2024-01-15"
  };

  return <ToolDetailView tool={mockTool} />;
}
