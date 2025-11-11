import { Link } from "wouter";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-lg font-bold">AI</span>
              </div>
              <span className="hidden font-semibold sm:inline-block">AI Tools Directory</span>
            </div>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search AI tools..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Link href="/categories" data-testid="link-categories">
              <Button variant="ghost" size="default">
                Categories
              </Button>
            </Link>
            <Link href="/admin" data-testid="link-admin">
              <Button variant="outline" size="default" data-testid="button-admin">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
