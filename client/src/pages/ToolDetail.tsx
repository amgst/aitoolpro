import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ToolDetailView from "@/components/ToolDetailView";
import Footer from "@/components/Footer";
import type { Tool } from "@shared/schema";
import { useEffect, useState } from "react";
import { useSEO } from "@/hooks/useSEO";

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

  useSEO({
    title: tool ? `${tool.name} - AI Tools Directory` : "AI Tool - AI Tools Directory",
    description: tool?.shortDescription || tool?.description || "Discover AI tools for your business",
    image: tool?.logoUrl || "/favicon.png",
    url: typeof window !== "undefined" ? window.location.href : "",
    type: "article",
    structuredData: tool ? {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": tool.name,
      "description": tool.description,
      "applicationCategory": tool.category,
      "offers": {
        "@type": "Offer",
        "price": tool.pricing === "Free" ? "0" : undefined,
        "priceCurrency": "USD"
      },
      "aggregateRating": tool.rating ? {
        "@type": "AggregateRating",
        "ratingValue": tool.rating,
        "ratingCount": 1
      } : undefined,
      "url": tool.websiteUrl,
      "image": tool.logoUrl
    } : undefined,
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
