import type { Metadata } from "next";
import { HeroSection } from "@/components/hub/HeroSection";
import { ToolGrid } from "@/components/hub/ToolGrid";

export const metadata: Metadata = {
  title: "everythinghub — Her Şeyin Merkezi",
  description:
    "YouTube araçları, görsel araçları, geliştirici araçları ve daha fazlası. Login gerektirmez, tamamen ücretsiz.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ToolGrid />
    </>
  );
}
