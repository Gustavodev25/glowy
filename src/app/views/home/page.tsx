"use client";

import Topbar from "@/app/components/Topbar";
import Hero from "./components/Hero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Hero />
    </div>
  );
}
