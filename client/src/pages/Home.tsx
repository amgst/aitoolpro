import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilters from "@/components/CategoryFilters";
import ToolGrid from "@/components/ToolGrid";
import type { Tool } from "@shared/schema";
import { useEffect } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: tools = [], isLoading, isError, error } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
  });

  // Initialize selected category from query param for deep links like /?category=Design
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
  }, []);

  const categories = useMemo(() => 
    Array.from(new Set(tools.map(tool => tool.category))),
    [tools]
  );

  const filteredTools = useMemo(() => 
    tools.filter(tool => {
      const matchesSearch = searchQuery === "" || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === null || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }),
    [tools, searchQuery, selectedCategory]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Hero 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        onSearch={() => console.log('Search triggered')}
      />
      <CategoryFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <main className="container mx-auto px-4 py-12 lg:px-8">
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : isError ? (
          <div className="text-center text-red-600">
            Failed to load tools. {error instanceof Error ? error.message : String(error)}<br />
            <a className="underline" href="/api/health" target="_blank" rel="noreferrer">Check API health</a>
          </div>
        ) : (
          <ToolGrid tools={filteredTools} />
        )}
      </main>
    </div>
  );
}
