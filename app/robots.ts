import type { MetadataRoute } from "next";

import { siteUrl } from "@/content/site";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? siteUrl;

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
