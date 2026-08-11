"use client";
import { useState } from "react";
import { HeroSection } from "@/components/hub/HeroSection";
import { ToolGrid } from "@/components/hub/ToolGrid";

export function HomeSearchWrapper() {
  const [search, setSearch] = useState("");
  return (
    <>
      <HeroSection searchQuery={search} onSearch={(q) => setSearch(q)} />
      <ToolGrid searchQuery={search} onSearch={(q) => setSearch(q)} />
    </>
  );
}
