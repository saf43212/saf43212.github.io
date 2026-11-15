"use client";

/**
 * Мобильная панель быстрых действий (заявка + звонок).
 *
 * Видна только на телефонах (< 768px): после прокрутки первого экрана
 * выезжает снизу, у верха страницы прячется. Показ управляется
 * атрибутом data-shown — transform и стили лежат в globals.css.
 * Кнопка заявки открывает LeadModal через делегированный
 * data-lead-open, отдельной логики не нужно.
 */
import { useEffect, useRef } from "react";

export function Actionbar({ phoneHref }: { phoneHref: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(max-width: 767px)");
    let raf = 0;

    const update = () => {
      raf = 0;
      const pastHero = window.scrollY > window.innerHeight * 0.7;
      el.dataset.shown = mq.matches && pastHero ? "true" : "false";
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <nav ref={ref} className="actionbar" aria-label="Быстрые действия">
      <button className="btn btn--primary" type="button" data-lead-open>
        Оставить заявку
      </button>
      <a className="btn btn--ghost" href={phoneHref}>
        Позвонить
      </a>
    </nav>
  );
}
