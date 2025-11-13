import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilters from "@/components/CategoryFilters";
import ToolGrid from "@/components/ToolGrid";
import Footer from "@/components/Footer";
import type { Tool } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Initialize selected category from query param for deep links like /?category=Design
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
  }, []);

  type PagedTools = { items: Tool[]; total: number };
  type CategoryRow = { category: string; count: number };

  const { data: categoriesRows = [] } = useQuery<CategoryRow[]>({
    queryKey: ['/api/categories'],
  });
  const categories = useMemo(
    () => categoriesRows.map(r => r.category),
    [categoriesRows],
  );

  const { data, isLoading, isError, error } = useQuery<PagedTools>({
    queryKey: ['tools', page, pageSize, searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedCategory) params.set("category", selectedCategory);
      const res = await fetch(`/api/tools?${params.toString()}`, { credentials: "include" });
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(text);
      }
      const totalHeader = res.headers.get("x-total-count");
      const items = await res.json();
      return { items, total: totalHeader ? parseInt(totalHeader, 10) : items.length };
    },
    keepPreviousData: true,
  });

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  const onSelectCategory = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  useSEO({
    title: selectedCategory 
      ? `${selectedCategory} AI Tools - AI Tools Directory`
      : "AI Tools Directory - Discover the Best AI Tools",
    description: selectedCategory
      ? `Discover the best ${selectedCategory} AI tools. Browse our curated collection of ${selectedCategory.toLowerCase()} tools for your business.`
      : "Discover and explore the best AI tools for your business. Browse our curated directory of AI-powered software, from content generation to data analysis.",
    url: typeof window !== "undefined" ? window.location.href : "",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "AI Tools Directory",
      "description": "Discover the best AI tools for your business",
      "url": typeof window !== "undefined" ? window.location.origin : "",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": typeof window !== "undefined" ? `${window.location.origin}/?search={search_term_string}` : ""
        },
        "query-input": "required name=search_term_string"
      }
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar searchQuery={searchQuery} onSearchChange={(v) => { setSearchQuery(v); setPage(1); }} />
      <Hero 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        onSearch={() => console.log('Search triggered')}
      />
      <CategoryFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={onSelectCategory}
      />
      <main className="container mx-auto flex-1 px-4 py-12 lg:px-8">
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : isError ? (
          <div className="text-center text-red-600">
            Failed to load tools. {error instanceof Error ? error.message : String(error)}<br />
            <a className="underline" href="/api/health" target="_blank" rel="noreferrer">Check API health</a>
          </div>
        ) : (
          <>
            <ToolGrid tools={items} />
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} {total ? `(Total ${total})` : ""}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
