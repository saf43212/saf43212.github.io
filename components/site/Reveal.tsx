"use client";

/**
 * Появление секций и пауза бегущей строки.
 *
 * Один IntersectionObserver на всю страницу, без библиотек.
 *
 *  - [data-reveal] и .sec-head получают .is-visible / .is-revealed при входе
 *    в вьюпорт и больше не отслеживаются (анимация одноразовая). Стили
 *    появления живут в app/globals.css, раздел 22.
 *  - .marquee получает .is-offscreen, когда уходит с экрана: движение вне
 *    вьюпорта бессмысленно, а WCAG 2.2.2 требует возможности остановить.
 *  - Клик по .marquee__toggle переключает .is-paused и aria-pressed,
 *    выбор запоминается в localStorage.
 *
 * Учитывает prefers-reduced-motion: при нём всё сразу видно.
 */
import { useEffect } from "react";

const PAUSE_KEY = "linia-marquee-paused";

export function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], .sec-head")
    );
    const marquees = Array.from(
      document.querySelectorAll<HTMLElement>(".marquee")
    );

    const showAll = () => {
      for (const el of items) {
        el.classList.add(el.classList.contains("sec-head") ? "is-revealed" : "is-visible");
      }
    };

    if (reduced || !("IntersectionObserver" in window)) {
      showAll();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            el.classList.add(
              el.classList.contains("sec-head") ? "is-revealed" : "is-visible"
            );
            io.unobserve(el);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );

      for (const el of items) io.observe(el);

      // Ленты вне экрана не анимируем: меньше работы для композитора
      // и меньше движения без причины.
      const ioMarquee = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
          }
        },
        { threshold: 0 }
      );

      for (const el of marquees) ioMarquee.observe(el);

      const onToggle = (event: Event) => {
        const btn = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
          ".marquee__toggle"
        );
        if (!btn) return;
        const marqueeEl = btn.closest<HTMLElement>(".marquee");
        if (!marqueeEl) return;
        const paused = marqueeEl.classList.toggle("is-paused");
        btn.setAttribute("aria-pressed", paused ? "true" : "false");
        btn.setAttribute(
          "aria-label",
          paused ? "Продолжить бегущую строку" : "Остановить бегущую строку"
        );
        try {
          localStorage.setItem(PAUSE_KEY, paused ? "1" : "0");
        } catch {
          /* приватный режим — просто не запоминаем */
        }
      };

      // Восстанавливаем прошлый выбор пользователя.
      let stored = false;
      try {
        stored = localStorage.getItem(PAUSE_KEY) === "1";
      } catch {
        stored = false;
      }

      if (stored) {
        for (const el of marquees) {
          el.classList.add("is-paused");
          const btn = el.querySelector<HTMLButtonElement>(".marquee__toggle");
          if (btn) {
            btn.setAttribute("aria-pressed", "true");
            btn.setAttribute(
              "aria-label",
              "Продолжить бегущую строку"
            );
          }
        }
      }

      document.addEventListener("click", onToggle);

      return () => {
        io.disconnect();
        ioMarquee.disconnect();
        document.removeEventListener("click", onToggle);
      };
    }

    return () => {
      /* наблюдателей не было — чистить нечего */
    };
  }, []);

  return null;
}
