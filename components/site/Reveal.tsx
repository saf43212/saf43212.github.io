"use client";

/**
 * Появление секций при прокрутке.
 *
 * Один InterObserver на всю страницу, без библиотек. Элементы с атрибутом
 * [data-reveal] получают .is-visible при входе в вьюпорт и больше не
 * отслеживаются (анимация одноразовая).
 *
 * Учитывает prefers-reduced-motion: при нём всё сразу видно.
 */
import { useEffect } from "react";

export function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (reduced) {
      for (const el of items) el.classList.add("is-visible");
      return;
    }

    if (!("IntersectionObserver" in window)) {
      for (const el of items) el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    for (const el of items) io.observe(el);

    return () => io.disconnect();
  }, []);

  return null;
}
