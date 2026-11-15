import type { Metadata, Viewport } from "next";
import "@fontsource/source-serif-4/cyrillic-400.css";
import "@fontsource/source-serif-4/cyrillic-600.css";
import "@fontsource/source-serif-4/latin-400.css";
import "@fontsource/source-serif-4/latin-600.css";
import "@fontsource/onest/cyrillic-400.css";
import "@fontsource/onest/cyrillic-500.css";
import "@fontsource/onest/cyrillic-600.css";
import "@fontsource/onest/latin-400.css";
import "@fontsource/onest/latin-500.css";
import "@fontsource/onest/latin-600.css";
import "./globals.css";
import { getSettings } from "@/lib/site";
import { cityIn } from "@/lib/text";
import { siteUrl } from "@/content/site";
import { Reveal } from "@/components/site/Reveal";

/** Публичный адрес сайта — для canonical, sitemap и Open Graph. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? siteUrl;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f0ea",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const company = settings.company_name ?? "ЛИНИЯ";
  const city = settings.city ?? "Кисловодск";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${company} — ремонт квартир в ${cityIn(city)}`,
      template: `%s — ${company}`,
    },
    description:
      "Ремонтные и отделочные работы в Кисловодске и на Кавказских Минеральных Водах. Смета после бесплатного замера, договор, приёмка по этапам.",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: company,
      title: `${company} — ремонт квартир в ${cityIn(city)}`,
      description:
        "Ремонтные и отделочные работы в Кисловодске и на Кавказских Минеральных Водах.",
      url: "/",
      images: [{ url: "/share.jpg", width: 1200, height: 630 }],
    },
    icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Reveal />
        {children}
      </body>
    </html>
  );
}
