import type { MetadataRoute } from "next";
import { getLiveTools } from "@/lib/tools-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.everythinghub.com.tr";
  const liveTools = getLiveTools();
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          tr: `${baseUrl}`,
          en: `${baseUrl}`,
          "x-default": `${baseUrl}`,
        },
      },
    },
    ...liveTools.map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: tool.featured ? 0.9 : 0.8,
      alternates: {
        languages: {
          tr: `${baseUrl}/tools/${tool.slug}`,
          en: `${baseUrl}/tools/${tool.slug}`,
          "x-default": `${baseUrl}/tools/${tool.slug}`,
        },
      },
    })),
  ];
}
