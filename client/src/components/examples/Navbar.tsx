import Navbar from "../Navbar";
import { useState } from "react";

export default function NavbarExample() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
  );
}
