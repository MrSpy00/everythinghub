import type { Metadata } from "next";
import { GradientClient } from "./GradientClient";

export const metadata: Metadata = {
  title: "CSS & Tailwind Gradient Üretici",
  description: "Modern CSS ve Tailwind CSS gradient kodları oluşturun ve kopyalayın.",
  keywords: ["css gradient", "tailwind gradient", "gradient generator", "renk paleti"],
};

export default function GradientPage() {
  return <GradientClient />;
}
