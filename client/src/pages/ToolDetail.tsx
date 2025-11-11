import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ToolDetailView from "@/components/ToolDetailView";
import type { Tool } from "@shared/schema";
import { useState } from "react";

export default function ToolDetail() {
  const [, params] = useRoute("/tool/:slug");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: tool, isLoading } = useQuery<Tool>({
    queryKey: ['/api/tools', params?.slug],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex h-[50vh] flex-col items-center justify-center">
          <h2 className="mb-2 text-2xl font-semibold">Tool not found</h2>
          <p className="text-muted-foreground">The tool you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ToolDetailView tool={tool} />
    </div>
  );
}
