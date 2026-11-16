import type { Metadata } from "next";
import Link from "next/link";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Actionbar } from "@/components/site/Actionbar";
import { LeadModal } from "@/components/site/LeadModal";
import { DesignGallery } from "@/components/site/DesignGallery";
import { plural } from "@/lib/plural";
import { designGroups, designTotal } from "@/content/design";
import { getSettings } from "@/lib/site";
import { cityIn } from "@/lib/text";

export const metadata: Metadata = {
  title: "Дизайн-проекты интерьеров",
  description:
    "Визуализации дизайн-проектов: гостиная, спальня, детская, ванная, душевая, холл. Рендеры интерьеров до начала ремонтных работ.",
  alternates: { canonical: "/design/" },
};

export default async function DesignPage() {
  const settings = await getSettings();

  const companyName = settings.company_name ?? "ЛИНИЯ";
  const city = settings.city ?? "Кисловодск";
  const phone = settings.phone || "+7 928 000-00-00";
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const email = settings.form_email || settings.email || "hello@linia.example";
  const workHours = settings.work_hours || "Пн–Сб, 9:00–19:00";

  return (
    <>
      <Header settings={{ companyName, phone, phoneHref }} />

      <main id="top">
        <section className="section section--tight design-hero">
          <div className="wrap">
            <nav className="crumbs" aria-label="Хлебные крошки">
              <Link href="/">Главная</Link>
              <span aria-hidden="true">/</span>
              <span>Дизайн-проекты</span>
            </nav>

            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">Портфолио</p>
                <h1>Дизайн-проекты интерьеров</h1>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  {designTotal}{" "}
                  {plural(designTotal, ["визуализация", "визуализации", "визуализаций"])}{" "}
                  в {designGroups.length}{" "}
                  {plural(designGroups.length, ["серии", "сериях", "сериях"])}: от
                  общей зоны до санузлов. Это рендеры проекта — не фотографии
                  готового объекта.
                </p>
              </div>
            </div>

            <DesignGallery groups={designGroups} />
          </div>
        </section>

        <section className="section section--ink design-cta" aria-labelledby="design-cta-h">
          <div className="wrap design-cta__inner">
            <div>
              <p className="sec-num">Ремонт в {cityIn(city)}</p>
              <h2 id="design-cta-h">Сделаем такой же интерьер в вашей квартире</h2>
              <p className="t-lead">
                Замер, смета и план работ — бесплатно. Покажем, как проект
                превращается в готовое помещение.
              </p>
            </div>
            <div className="btn-row">
              <button className="btn btn--primary btn--lg" type="button" data-lead-open>
                Оставить заявку
              </button>
              <a className="btn btn--ghost btn--lg" href={phoneHref}>
                {phone}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer
        settings={{
          companyName,
          companyLegal: settings.company_legal ?? companyName,
          city,
          region: settings.region ?? "Кавказские Минеральные Воды",
          phone,
          phoneHref,
          email,
          workHours,
        }}
      />

      <Actionbar phoneHref={phoneHref} />
      <LeadModal source="design" page="/design/" defaultCity={city} />
    </>
  );
}
