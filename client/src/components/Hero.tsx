import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export default function Hero({ searchQuery, onSearchChange, onSearch }: HeroProps) {
  return (
    <div className="relative min-h-[400px] lg:min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      <div className="container relative z-10 mx-auto px-4 text-center lg:px-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-6xl">
          Discover the Best AI Tools
        </h1>
        <p className="mb-8 text-lg text-muted-foreground lg:text-xl">
          Browse our curated directory of AI-powered software to boost your productivity
        </p>

        <div className="mx-auto flex max-w-2xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for AI tools..."
              className="h-14 pl-10 text-base backdrop-blur-md"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              data-testid="input-hero-search"
            />
          </div>
          <Button
            size="lg"
            className="h-14 px-8"
            onClick={onSearch}
            data-testid="button-hero-search"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
