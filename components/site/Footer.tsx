/**
 * Подвал: бренд, навигация по якорям, контакты, документы.
 */
import Link from "next/link";

import { cityIn, regionOn } from "@/lib/text";

export type FooterSettings = {
  companyName: string;
  companyLegal: string;
  city: string;
  region: string;
  phone: string;
  phoneHref: string;
  email: string;
  workHours: string;
};

const NAV = [
  { href: "#services", label: "Услуги" },
  { href: "#work", label: "Работы" },
  { href: "#about", label: "О компании" },
  { href: "#process", label: "Этапы" },
  { href: "#calculator", label: "Калькулятор" },
  { href: "#faq", label: "Вопросы" },
];

export function Footer({ settings }: { settings: FooterSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contact">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <a className="logo" href="#top" aria-label={`${settings.companyName} — на главную`}>
              <svg className="logo__mark" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20V4l16 16V4" />
              </svg>
              {settings.companyName}
            </a>
            <p className="footer__lede">
              Ремонт и отделка квартир, домов и коммерческих помещений в{" "}
              {cityIn(settings.city)} и на {regionOn(settings.region)}.
            </p>
            <p className="footer__lede">
              {settings.workHours}
            </p>
          </div>

          <div className="footer__col">
            <h3>Разделы</h3>
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3>Связь</h3>
            <ul>
              <li>
                <a href={settings.phoneHref}>{settings.phone}</a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
              <li>
                <a href="#quote">Оставить заявку</a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h3>Документы</h3>
            <ul>
              <li>
                <Link href="/privacy">Политика конфиденциальности</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {year} {settings.companyLegal || settings.companyName}
          </span>
        </div>
      </div>
    </footer>
  );
}
