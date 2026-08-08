import type { Metadata } from "next";
import { Base64Client } from "./Base64Client";

export const metadata: Metadata = {
  title: "Base64 Kodlayıcı & Çözücü",
  description: "Metin ve verileri Base64 formatına kodlayın ve güvenle geri çözün.",
  keywords: ["base64 encoder", "base64 decoder", "kodlayıcı", "çözücü", "base64 online"],
};

export default function Base64Page() {
  return <Base64Client />;
}
