import CategoryFilters from "../CategoryFilters";
import { useState } from "react";

export default function CategoryFiltersExample() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = ["Content Creation", "Data Analysis", "Image Generation", "Code Assistant", "Marketing"];

  return (
    <CategoryFilters
      categories={categories}
      selectedCategory={selectedCategory}
      onCategorySelect={setSelectedCategory}
    />
  );
}
