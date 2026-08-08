import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — EverythingHub",
    default: "Dijital Araçlar Stüdyosu — EverythingHub",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
