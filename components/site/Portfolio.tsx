"use client";

/**
 * Портфолио: фильтры по типу работ + сетка плиток + лайтбокс.
 *
 * Фотографии берутся из существующей базы (projects / project_photos).
 * Ничего не выдумываем: если у проекта нет фотографий, он не показывается.
 * Под плиткой — название объекта и вид работ. Город, площадь и срок
 * сознательно не выводим: на карточке это читалось как обещание по срокам
 * и ценам, которого мы не можем подтвердить.
 */
import { useEffect, useMemo, useRef, useState } from "react";

export type WorkItem = {
  id: number;
  slug: string;
  title: string;
  serviceTitle: string | null;
  /** Короткое описание состава работ */
  description: string | null;
  photos: { file: string; alt: string }[];
};

type Props = {
  items: WorkItem[];
};

export function Portfolio({ items }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // Только проекты, у которых есть фото.
  const withPhotos = useMemo(
    () => items.filter((p) => p.photos.length > 0),
    [items]
  );

  // Плоский список фотографий для лайтбокса.
  const flat = useMemo(() => {
    const out: {
      file: string;
      alt: string;
      title: string;
      service: string;
      description: string;
    }[] = [];
    for (const p of withPhotos) {
      for (const ph of p.photos) {
        out.push({
          file: ph.file,
          alt: ph.alt,
          title: p.title,
          service: p.serviceTitle ?? "",
          description: p.description ?? "",
        });
      }
    }
    return out;
  }, [withPhotos]);

  const filters = useMemo(() => {
    const set = new Set<string>();
    for (const p of withPhotos) if (p.serviceTitle) set.add(p.serviceTitle);
    return ["all", ...Array.from(set)];
  }, [withPhotos]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? withPhotos
        : withPhotos.filter((p) => p.serviceTitle === filter),
    [filter, withPhotos]
  );

  const indexOf = (file: string) => flat.findIndex((f) => f.file === file);

  const openAt = (file: string) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setOpenIndex(indexOf(file));
  };

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
  }, [openIndex]);

  if (withPhotos.length === 0) return null;

  const current = openIndex !== null ? flat[openIndex] : null;

  return (
    <>
      {filters.length > 2 ? (
        <div className="filters" role="group" aria-label="Фильтр по типу работ">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className="filter"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Все работы" : f}
            </button>
          ))}
        </div>
      ) : null}

      <div className="work-grid">
        {visible.map((p) => {
          return (
            <button
              key={p.slug}
              type="button"
              className="work-card"
              onClick={() => openAt(p.photos[0].file)}
              aria-label={`Открыть фото: ${p.title}${
                p.serviceTitle ? ` — ${p.serviceTitle}` : ""
              }`}
            >
              <span className="work-card__media">
                <img
                  src={p.photos[0].file}
                  alt={p.photos[0].alt}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={960}
                />
                <span className="work-card__overlay">
                  <span className="work-card__caption">
                    <strong>{p.title}</strong>
                    {p.serviceTitle ? <span>{p.serviceTitle}</span> : null}
                  </span>
                  <span className="work-card__zoom" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <path
                        d="M7 1v12M1 7h12"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </span>
              </span>
              <span className="work-card__meta">
                <strong>{p.title}</strong>
                {p.serviceTitle ? <span>{p.serviceTitle}</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      {current ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
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
                aria-label="Предыдущее фото"
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
                aria-label="Следующее фото"
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
            <img className="lightbox__img" src={current.file} alt={current.alt} />
            <figcaption className="lightbox__caption">
              <span className="lightbox__caption-main">
                <strong>{current.title}</strong>
                <span>
                  {current.service}
                  {openIndex !== null
                    ? `${current.service ? " · " : ""}${openIndex + 1} из ${
                        flat.length
                      }`
                    : ""}
                </span>
                {current.description ? (
                  <span className="lightbox__caption-text">
                    {current.description}
                  </span>
                ) : null}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
