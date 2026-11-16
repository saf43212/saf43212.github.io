import type { MetadataRoute } from "next";

import { siteUrl } from "@/content/site";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? siteUrl;

export const dynamic = "force-static";

/** Лендинг + страницы портфолио; всё остальное живёт якорями на главной. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/design/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/privacy/`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
