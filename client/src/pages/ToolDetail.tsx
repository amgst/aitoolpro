import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ToolDetailView from "@/components/ToolDetailView";
import Footer from "@/components/Footer";
import type { Tool } from "@shared/schema";
import { useEffect, useState } from "react";

export default function ToolDetail() {
  const [, params] = useRoute("/tool/:slug");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [params?.slug]);
  
  const { data: tool, isLoading } = useQuery<Tool>({
    queryKey: ['/api/tools', params?.slug],
    enabled: !!params?.slug,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1">
        {isLoading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : !tool ? (
          <div className="flex h-[50vh] flex-col items-center justify-center">
            <h2 className="mb-2 text-2xl font-semibold">Tool not found</h2>
            <p className="text-muted-foreground">The tool you're looking for doesn't exist.</p>
          </div>
        ) : (
          <ToolDetailView tool={tool} />
        )}
      </main>
      <Footer />
    </div>
  );
}
