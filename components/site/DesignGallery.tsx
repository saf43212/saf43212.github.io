"use client";

/**
 * Галерея дизайн-проектов: фильтр по сериям, сетка плиток и лайтбокс.
 *
 * Масонри-колонки: рендеры бывают и портретные, и горизонтальные, резать
 * их по сетке нельзя. Превью 640px грузятся лениво, полный кадр 1600px
 * подгружается только при открытии лайтбокса.
 */
import { useEffect, useMemo, useRef, useState } from "react";

import { plural } from "@/lib/plural";

export type DesignItem = {
  src: string;
  thumb: string;
  width: number;
  height: number;
  alt: string;
};

export type DesignGroup = {
  slug: string;
  title: string;
  note: string;
  items: DesignItem[];
};

export function DesignGallery({ groups }: { groups: DesignGroup[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const total = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups]
  );

  const flat = useMemo(() => {
    const source = filter === "all" ? groups : groups.filter((g) => g.slug === filter);
    const out: { item: DesignItem; group: DesignGroup }[] = [];
    for (const g of source) for (const item of g.items) out.push({ item, group: g });
    return out;
  }, [filter, groups]);

  const close = () => {
    setOpenIndex(null);
    lastFocus.current?.focus();
  };

  const step = (dir: 1 | -1) => {
    setOpenIndex((prev) => {
      if (prev === null) return prev;
      return (prev + dir + flat.length) % flat.length;
    });
  };

  useEffect(() => {
    if (openIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [openIndex, flat.length]);

  if (total === 0) return null;
  const current = openIndex !== null ? flat[openIndex] : null;

  return (
    <>
      <div className="filters" role="group" aria-label="Фильтр по сериям">
        <button
          type="button"
          className="filter"
          aria-pressed={filter === "all"}
          onClick={() => {
            setFilter("all");
            setOpenIndex(null);
          }}
        >
          Все серии
          <span className="filter__count">{total}</span>
        </button>
        {groups.map((g) => (
          <button
            key={g.slug}
            type="button"
            className="filter"
            aria-pressed={filter === g.slug}
            onClick={() => {
              setFilter(g.slug);
              setOpenIndex(null);
            }}
          >
            {g.title}
            <span className="filter__count">{g.items.length}</span>
          </button>
        ))}
      </div>

      <p className="design-count t-small muted">
        {total} {plural(total, ["рендер", "рендера", "рендеров"])} в{" "}
        {groups.length} {plural(groups.length, ["серии", "сериях", "сериях"])}
        {filter === "all" ? "" : " · показана одна серия"}
      </p>

      <div className="design-grid">
        {flat.map(({ item, group }, i) => (
          <figure className="design-card" key={item.src}>
            <button
              type="button"
              className="design-card__btn"
              onClick={() => {
                lastFocus.current = document.activeElement as HTMLElement;
                setOpenIndex(i);
              }}
              aria-label={`Открыть рендер: ${item.alt}`}
            >
              <img
                src={item.thumb}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width={item.width}
                height={item.height}
              />
              <span className="design-card__zoom" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path
                    d="M7 1v12M1 7h12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            <figcaption className="design-card__caption">
              <span>{group.title}</span>
              <span className="design-card__index">
                {String(i + 1).padStart(2, "0")}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {current ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.item.alt}
          ref={dialogRef}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button
            className="lightbox__close"
            type="button"
            onClick={close}
            aria-label="Закрыть"
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

          {flat.length > 1 ? (
            <>
              <button
                className="lightbox__nav lightbox__nav--prev"
                type="button"
                onClick={() => step(-1)}
                aria-label="Предыдущий рендер"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M10 3L5 8l5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
              <button
                className="lightbox__nav lightbox__nav--next"
                type="button"
                onClick={() => step(1)}
                aria-label="Следующий рендер"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            </>
          ) : null}

          <figure className="lightbox__figure">
            <img
              className="lightbox__img"
              src={current.item.src}
              alt={current.item.alt}
            />
            <figcaption className="lightbox__caption">
              <strong>{current.group.title}</strong>
              <span>
                {current.group.note}
                {openIndex !== null ? ` · ${openIndex + 1} из ${flat.length}` : ""}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
