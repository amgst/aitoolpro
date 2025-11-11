import { Badge } from "@/components/ui/badge";

interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export default function CategoryFilters({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryFiltersProps) {
  return (
    <div className="w-full border-b bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          <Badge
            variant={selectedCategory === null ? "default" : "secondary"}
            className="cursor-pointer whitespace-nowrap hover-elevate active-elevate-2"
            onClick={() => onCategorySelect(null)}
            data-testid="filter-all"
          >
            All Tools
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap hover-elevate active-elevate-2"
              onClick={() => onCategorySelect(category)}
              data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
