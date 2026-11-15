import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const settings = await getSettings();

  const companyName = settings.company_name ?? "ЛИНИЯ";
  const city = settings.city ?? "Кисловодск";
  const region = settings.region ?? "Кавказские Минеральные Воды";
  const phone = settings.phone || "+7 928 000-00-00";
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const email = settings.form_email || settings.email || "hello@linia.example";

  return (
    <>
      <Header settings={{ companyName, phone, phoneHref }} />

      <main id="top">
        <section className="section" aria-labelledby="nf-h">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">Ошибка 404</p>
                <h1 id="nf-h">Страница не найдена</h1>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Возможно, адрес изменился или в ссылке опечатка. Начните с
                  главной — там услуги, работы и калькулятор.
                </p>
              </div>
            </div>

            <div className="btn-row">
              <Link className="btn btn--primary" href="/">
                На главную
              </Link>
              <Link className="btn btn--ghost" href="/#services">
                Смотреть услуги
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer
        settings={{
          companyName,
          companyLegal: settings.company_legal ?? companyName,
          city,
          region,
          phone,
          phoneHref,
          email,
          workHours: settings.work_hours || "Пн–Сб, 9:00–19:00",
        }}
      />
    </>
  );
}
