import Hero from "../Hero";
import { useState } from "react";

export default function HeroExample() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Hero
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearch={() => console.log('Search triggered:', searchQuery)}
    />
  );
}
