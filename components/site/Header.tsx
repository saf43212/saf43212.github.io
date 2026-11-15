"use client";

/**
 * Шапка лендинга: логотип, навигация по якорям, телефон и CTA.
 * На мобильных — отдельное полноэкранное меню.
 *
 * Настройки приходят пропсом из серверного layout: клиентский компонент
 * не может сам читать базу.
 */
import { useEffect, useState } from "react";

const NAV = [
  { href: "#services", label: "Услуги" },
  { href: "#work", label: "Работы" },
  { href: "#about", label: "О компании" },
  { href: "#process", label: "Этапы" },
  { href: "#calculator", label: "Калькулятор" },
  { href: "#faq", label: "Вопросы" },
];

export type HeaderSettings = {
  companyName: string;
  phone: string;
  phoneHref: string;
};

export function Header({ settings }: { settings: HeaderSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header" data-scrolled={scrolled ? "true" : "false"}>
        <div className="wrap site-header__bar">
          <a
            className="logo"
            href="#top"
            aria-label={`${settings.companyName} — на главную`}
          >
            <svg className="logo__mark" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20V4l16 16V4" />
            </svg>
            {settings.companyName}
          </a>

          <nav className="site-header__nav" aria-label="Основная навигация">
            {NAV.map((item) => (
              <a key={item.href} className="site-header__link" href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="site-header__actions">
            <a className="site-header__phone" href={settings.phoneHref}>
              {settings.phone}
            </a>
            <a className="btn btn--primary site-header__cta" href="#calculator">
              Рассчитать стоимость
            </a>
            <button
              className="burger"
              type="button"
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  d="M2 5h14M2 13h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <div className="mobile-nav__top">
            <a className="logo" href="#top" onClick={() => setMenuOpen(false)}>
              <svg className="logo__mark" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20V4l16 16V4" />
              </svg>
              {settings.companyName}
            </a>
            <button
              className="burger"
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setMenuOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav className="mobile-nav__links" aria-label="Мобильная навигация">
            {NAV.map((item, i) => (
              <a
                key={item.href}
                className="mobile-nav__link"
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <span>{String(i + 1).padStart(2, "0")}</span>
              </a>
            ))}
          </nav>

          <div className="mobile-nav__foot">
            <a
              className="btn btn--primary btn--lg btn--wide"
              href="#calculator"
              onClick={() => setMenuOpen(false)}
            >
              Рассчитать стоимость
            </a>
            <a className="btn btn--ghost btn--lg btn--wide" href={settings.phoneHref}>
              {settings.phone}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
