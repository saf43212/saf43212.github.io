"use client";

/**
 * Мобильная панель быстрых действий (заявка + звонок).
 *
 * Видна только на телефонах (< 768px) и с первого экрана: на узком экране
 * телефон из шапки скрыт, и без панели позвонить можно только через меню.
 * Показ управляется атрибутом data-shown — transform и стили лежат
 * в globals.css. Кнопка заявки открывает LeadModal через делегированный
 * data-lead-open, отдельной логики не нужно.
 */
import { useEffect, useRef } from "react";

export function Actionbar({ phoneHref }: { phoneHref: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(max-width: 767px)");

    // Панель нужна с самого верха: это единственный способ позвонить
    // в один тап на телефоне. Прячем только на десктопе.
    const update = () => {
      el.dataset.shown = mq.matches ? "true" : "false";
    };

    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
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
