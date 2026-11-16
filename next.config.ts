import { lookup } from "node:dns/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

const DNS_TIMEOUT_MS = 4000;

/**
 * Читает адреса из content/site.ts, не импортируя модуль целиком
 * (next.config выполняется отдельным шагом до компиляции).
 */
function readSiteUrls(): { desired: string; fallback: string } {
  try {
    const source = readFileSync(join(process.cwd(), "content/site.ts"), "utf8");
    const desired = source.match(/export const siteUrl = "([^"]+)"/)?.[1];
    const fallback = source.match(/export const fallbackSiteUrl = "([^"]+)"/)?.[1];
    if (desired && fallback) return { desired, fallback };
  } catch {
    // ниже — безопасное значение по умолчанию
  }
  return { desired: "https://saf43212.github.io", fallback: "https://saf43212.github.io" };
}

/**
 * Выбирает публичный адрес сайта на момент сборки.
 *
 * Если домен из `siteUrl` резолвится — сайт собирается с ним (canonical,
 * Open Graph, sitemap.xml, CNAME для GitHub Pages). Если нет — с запасным
 * адресом GitHub Pages: иначе canonical и sitemap указывали бы на мёртвый
 * домен, а файл CNAME увёл бы GitHub Pages с рабочего адреса.
 *
 * Явно заданный NEXT_PUBLIC_SITE_URL имеет приоритет и проверку отключает.
 */
async function pickSiteUrl(): Promise<void> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return;

  const { desired, fallback } = readSiteUrls();
  const host = new URL(desired).host;

  try {
    await Promise.race([
      lookup(host),
      new Promise((_, reject) => setTimeout(() => reject(new Error("dns timeout")), DNS_TIMEOUT_MS)),
    ]);
    process.env.NEXT_PUBLIC_SITE_URL = desired;
    console.log(`[site-url] домен ${host} резолвится — сборка с адресом ${desired}`);
  } catch {
    process.env.NEXT_PUBLIC_SITE_URL = fallback;
    console.log(
      `[site-url] домен ${host} не резолвится — сборка с запасным адресом ${fallback}. ` +
        "Направьте DNS домена на GitHub Pages (A 185.199.108.153/.109.154/.110.155/.111.156) и пересоберите сайт.",
    );
  }
}

const config: NextConfig = {
  // Статический лендинг: `npm run build` создаёт папку out/ — это готовый
  // сайт для GitHub Pages, без сервера, базы данных и админки.
  output: "export",
  // /privacy/ -> privacy/index.html: так GitHub Pages отдаёт страницы без
  // настройки красивых URL.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default async function nextConfig(): Promise<NextConfig> {
  await pickSiteUrl();
  return config;
}
