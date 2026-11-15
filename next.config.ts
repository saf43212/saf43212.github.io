import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статический лендинг: `npm run build` создаёт папку out/ — это готовый
  // сайт для GitHub Pages, без сервера, базы данных и админки.
  output: "export",
  // /privacy/ -> privacy/index.html: так GitHub Pages отдаёт страницы без
  // настройки красивых URL.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
