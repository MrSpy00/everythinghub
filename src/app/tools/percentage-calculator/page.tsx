import type { Metadata } from "next";
import { PercentageClient } from "./PercentageClient";

export const metadata: Metadata = {
  title: "Yüzde & İndirim Hesaplayıcı",
  description: "Yüzde artış, indirim tutarı ve oran hesaplamalarını anında yapın.",
  keywords: ["yüzde hesaplama", "percentage calculator", "indirim hesaplayıcı", "kdv hesaplama"],
};

export default function PercentagePage() {
  return <PercentageClient />;
}
