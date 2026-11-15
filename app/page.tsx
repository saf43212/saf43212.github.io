import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LeadForm } from "@/components/site/LeadForm";
import { LeadModal } from "@/components/site/LeadModal";
import { Actionbar } from "@/components/site/Actionbar";
import { Calculator } from "@/components/site/Calculator";
import { Portfolio } from "@/components/site/Portfolio";
import { getServices, getProjects, getSettings } from "@/lib/site";
import { ratesFromSettings } from "@/lib/calculator";
import { cityIn, regionOf, regionOn } from "@/lib/text";

export const metadata: Metadata = {
  title: "Ремонт квартир и домов в Кисловодске — «ЛИНИЯ»",
  description:
    "Ремонт и отделка квартир, домов и коммерческих помещений в Кисловодске и на Кавказских Минеральных Водах. Косметический, капитальный ремонт и под ключ. Смета после замера, приёмка по этапам.",
  alternates: { canonical: "/" },
};

/* ------------------------------------------------------------------ */
/* Статичные данные страницы (не факты о компании, а структура)        */
/* ------------------------------------------------------------------ */

const IMG = {
  hero: "/assets/img/photo-f192968130-960.webp",
  about: "/assets/img/shtukaturka-02-960.webp",
};

const SERVICE_IMAGES: Record<string, string> = {
  "kosmeticheskij-remont": "/assets/img/gostinaya-03-960.webp",
  "kapitalnyj-remont": "/assets/img/shtukaturka-03-960.webp",
  "remont-pod-klyuch": "/assets/img/gostinaya-01-960.webp",
  "remont-vannoj": "/assets/img/vannaya-01-960.webp",
  "remont-kuhni": "/assets/img/kuhnya-01-960.webp",
  "elektrika-i-santehnika": "/assets/img/plitka-01-960.webp",
};

const ADVANTAGES = [
  {
    n: "01",
    title: "Смета до начала работ",
    text: "После замера вы получаете смету с позициями и объёмами. Стоимость не меняется по ходу работ без вашего согласия.",
  },
  {
    n: "02",
    title: "Приёмка по этапам",
    text: "Каждый этап закрывается актом. Скрытые работы — электрика, стяжка, гидроизоляция — фиксируются до закрытия.",
  },
  {
    n: "03",
    title: "Материалы по чекам",
    text: "Закупаем сами или работаем с вашими поставщиками. Все чеки передаём — вы видите, за что заплатили.",
  },
  {
    n: "04",
    title: "Один договор",
    text: "Отделка, электрика, сантехника и плитка — в одном договоре. Не нужно искать отдельных подрядчиков.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Обсуждение задачи",
    text: "Созваниваемся, уточняем объём, состояние объекта и сроки. Договариваемся о замере.",
  },
  {
    n: "02",
    title: "Замер объекта",
    text: "Приезжаем на объект, замеряем помещения, фиксируем состояние стен, полов и инженерии.",
  },
  {
    n: "03",
    title: "Смета",
    text: "Готовим смету с позициями и объёмами. Обсуждаем, что можно сделать в первую очередь.",
  },
  {
    n: "04",
    title: "Согласование материалов",
    text: "Подбираем материалы под бюджет и задачу. Согласовываем поставщиков и сроки поставки.",
  },
  {
    n: "05",
    title: "Выполнение работ",
    text: "Работаем по этапам, каждый этап сдаём по акту. Держим вас в курсе, что происходит на объекте.",
  },
  {
    n: "06",
    title: "Контроль и сдача",
    text: "Проверяем результат по чек-листу, устраняем замечания и сдаём объект. Условия гарантии — в договоре.",
  },
];

const FAQ = [
  {
    q: "Сколько стоит ремонт?",
    a: "Точную стоимость даёт смета после замера: она зависит от площади, состояния объекта и объёма работ. Прикинуть диапазон можно в калькуляторе — он считает по площади и виду ремонта.",
  },
  {
    q: "Когда вы сможете начать?",
    a: "После замера и согласования сметы. Дату начала фиксируем в договоре вместе со сроком работ.",
  },
  {
    q: "Кто закупает материалы?",
    a: "Можем мы или вы — как удобнее. При нашей закупке передаём все чеки, вы видите каждую позицию.",
  },
  {
    q: "Можно ли жить в квартире во время ремонта?",
    a: "При косметическом ремонте — обычно да: работаем по комнатам и ежедневно убираем. При капитальном лучше на время съехать.",
  },
  {
    q: "Что, если что-то пойдёт не так после сдачи?",
    a: "Гарантийные обязательства и их срок прописываем в договоре. Условия обсуждаем до начала работ.",
  },
  {
    q: "Работаете ли вы за пределами Кисловодска?",
    a: "Да, работаем в Кисловодске и на Кавказских Минеральных Водах. Выезд на замер и детали обсуждаем при заявке.",
  },
];

/* ------------------------------------------------------------------ */
/* Страница                                                           */
/* ------------------------------------------------------------------ */

export default async function HomePage() {
  const [services, projects, settings] = await Promise.all([
    getServices(),
    getProjects(),
    getSettings(),
  ]);

  const rates = ratesFromSettings(settings);
  const ratesMissing = !(
    settings.calc_cosmetic ||
    settings.calc_capital ||
    settings.calc_designer
  );

  const companyName = settings.company_name ?? "ЛИНИЯ";
  const city = settings.city ?? "Кисловодск";
  const region = settings.region ?? "Кавказские Минеральные Воды";
  const phone = settings.phone || "+7 928 000-00-00";
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const email = settings.form_email || settings.email || "hello@linia.example";
  const workHours = settings.work_hours || "Пн–Сб, 9:00–19:00";

  const headerSettings = { companyName, phone, phoneHref };
  const footerSettings = {
    companyName,
    companyLegal: settings.company_legal ?? companyName,
    city,
    region,
    phone,
    phoneHref,
    email,
    workHours,
  };

  const workItems = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    serviceTitle: p.serviceTitle,
    photos: p.photos.map((ph) => ({ file: ph.file, alt: ph.alt })),
  }));

  return (
    <>
      <Header settings={headerSettings} />

      <main id="top">
        {/* ============ 1. HERO ============ */}
        <section className="hero" aria-labelledby="hero-h">
          <div className="wrap">
            <div className="hero__grid">
              <div className="hero__text">
                <p className="hero__kicker">
                  {city} и {region}
                </p>
                <h1 id="hero-h">
                  Ремонт, в котором каждая деталь имеет значение
                </h1>
                <p className="hero__lead">
                  Ремонт и отделка квартир, домов и коммерческих помещений в{" "}
                  {cityIn(city)} и городах {regionOf(region)}. Смета после замера,
                  приёмка по этапам.
                </p>
                <div className="btn-row">
                  <a className="btn btn--primary btn--lg" href="#calculator">
                    Рассчитать стоимость
                    <svg
                      className="arrow"
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 6h8M5 2l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                  <a className="btn btn--ghost btn--lg" href="#work">
                    Смотреть проекты
                  </a>
                </div>
              </div>

              <div className="hero__media">
                <figure className="hero__figure">
                  <img
                    src={IMG.hero}
                    alt="Гостиная после ремонта: светлые стены, диван и окно"
                    width={1600}
                    height={1068}
                    fetchPriority="high"
                    decoding="async"
                  />
                  <figcaption className="hero__badge">
                    <span className="hero__badge-label">Подход</span>
                    <span className="hero__badge-text">
                      Смета и договор до начала работ
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>

            <dl className="hero__facts">
              <div className="hero__fact">
                <dt>Смета</dt>
                <dd>После замера, до начала работ</dd>
              </div>
              <div className="hero__fact">
                <dt>Приёмка</dt>
                <dd>По этапам, с актами</dd>
              </div>
              <div className="hero__fact">
                <dt>География</dt>
                <dd>{city} и {region}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ============ 2. БЕГУЩАЯ СТРОКА ============ */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            <div className="marquee__group">
              {[
                "Косметический ремонт",
                "Капитальный ремонт",
                "Ремонт под ключ",
                "Ванные комнаты",
                "Кухни",
                "Электрика",
                "Сантехника",
                "Отделочные работы",
              ].map((t) => (
                <span className="marquee__item" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <div className="marquee__group">
              {[
                "Косметический ремонт",
                "Капитальный ремонт",
                "Ремонт под ключ",
                "Ванные комнаты",
                "Кухни",
                "Электрика",
                "Сантехника",
                "Отделочные работы",
              ].map((t) => (
                <span className="marquee__item" key={`${t}-2`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ============ 3. О КОМПАНИИ ============ */}
        <section className="section" id="about" aria-labelledby="about-h">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">01 — Компания</p>
                <h2 id="about-h">
                  Ремонтно-отделочная компания «{companyName}»
                </h2>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Работаем в {cityIn(city)} и на {regionOn(region)}: квартиры,
                  дома, коммерческие помещения. Средний и премиальный сегмент.
                </p>
              </div>
            </div>

            <div className="about">
              <div className="about__text">
                <p className="about__statement">
                  Ремонт — это не про «побыстрее и подешевле». Это про{" "}
                  <em>предсказуемый результат</em>, который через год выглядит
                  так же, как в день сдачи.
                </p>
                <div className="about__body">
                  <p>
                    Мы берём объект целиком: от демонтажа и инженерии до
                    чистовой отделки и установки дверей. Один договор, один
                    ответственный за результат.
                  </p>
                  <p>
                    Смета составляется после замера и фиксируется в договоре.
                    Скрытые работы — электрика, стяжка, гидроизоляция —
                    закрываются актами до того, как их закроют.
                  </p>
                  <p>
                    Материалы закупаем по чекам или работаем с вашими
                    поставщиками. Вы видите, за что платите.
                  </p>
                </div>
              </div>

              <figure className="about__figure">
                <img
                  src={IMG.about}
                  alt="Штукатурные работы: мастер выравнивает стену в помещении"
                  width={960}
                  height={1440}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </div>

            <div className="principles">
              {[
                {
                  n: "01",
                  t: "Премиальный внешний вид",
                  d: "Спокойные цвета, аккуратные стыки, качественные материалы.",
                },
                {
                  n: "02",
                  t: "Качественная реализация",
                  d: "Технологии соблюдаются, скрытые работы фиксируются актами.",
                },
                {
                  n: "03",
                  t: "Простота эксплуатации",
                  d: "Инженерия продумана так, чтобы обслуживание было удобным.",
                },
              ].map((p) => (
                <div className="principle" key={p.n}>
                  <span className="principle__num">{p.n}</span>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 4. УСЛУГИ ============ */}
        <section className="section" id="services" aria-labelledby="services-h">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">02 — Услуги</p>
                <h2 id="services-h">От косметики до ремонта под ключ</h2>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Каждая услуга — отдельный договор с понятным составом работ.
                  Можно взять целиком или по частям.
                </p>
                <a className="link" href="#quote">
                  Обсудить задачу
                  <svg className="arrow" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      d="M1 6h8M5 2l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="services">
              {services.map((s, i) => (
                <article className="service" key={s.slug}>
                  <div className="service__media">
                    <img
                      src={SERVICE_IMAGES[s.slug] ?? IMG.hero}
                      alt={s.title}
                      width={960}
                      height={600}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="service__body">
                    <span className="service__index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3>{s.title}</h3>
                    <p className="service__text">{s.short}</p>
                    <ul className="service__list">
                      {s.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className="service__foot">
                      <a className="link" href="#calculator">
                        Рассчитать
                        <svg
                          className="arrow"
                          viewBox="0 0 12 12"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 6h8M5 2l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 5. ПОРТФОЛИО ============ */}
        <section className="section" id="work" aria-labelledby="work-h">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">03 — Работы</p>
                <h2 id="work-h">Примеры работ</h2>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Фотографии показывают характер работ и типы интерьеров. Это
                  примеры, а не конкретные сданные объекты — собственные
                  фотографии появятся после публикации.
                </p>
              </div>
            </div>

            <Portfolio items={workItems} />
          </div>
        </section>

        {/* ============ 6. ПРЕИМУЩЕСТВА ============ */}
        <section
          className="section section--ink"
          id="advantages"
          aria-labelledby="adv-h"
        >
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">04 — Подход</p>
                <h2 id="adv-h">Как мы работаем</h2>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Четыре принципа, которые определяют, как устроен каждый
                  объект.
                </p>
              </div>
            </div>

            <div className="advantages">
              {ADVANTAGES.map((a) => (
                <div className="advantage" key={a.n}>
                  <span className="advantage__num">{a.n}</span>
                  <div className="advantage__body">
                    <h3>{a.title}</h3>
                    <p>{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 7. ЭТАПЫ ============ */}
        <section className="section" id="process" aria-labelledby="process-h">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">05 — Этапы</p>
                <h2 id="process-h">Как проходит ремонт</h2>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Шесть этапов от первого звонка до сдачи. Вы видите, что
                  происходит на объекте, и подписываете акты после каждого
                  этапа.
                </p>
              </div>
            </div>

            <div className="steps">
              {STEPS.map((s) => (
                <div className="step" key={s.n}>
                  <span className="step__num">{s.n}</span>
                  <div className="step__title">
                    <h3>{s.title}</h3>
                  </div>
                  <p className="step__text">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 8. КАЛЬКУЛЯТОР ============ */}
        <section
          className="section section--tight"
          id="calculator"
          aria-labelledby="calculator-h"
        >
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">06 — Калькулятор</p>
                <h2 id="calculator-h">Предварительный расчёт</h2>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Площадь, тип объекта и вид отделки — и вы видите диапазон
                  стоимости за две минуты. Точная стоимость — по смете после
                  замера.
                </p>
              </div>
            </div>

            <Calculator rates={rates} ratesMissing={ratesMissing} />
          </div>
        </section>

        {/* ============ 9. ФОРМА ЗАЯВКИ ============ */}
        <section className="section" id="quote" aria-labelledby="quote-h">
          <div className="wrap">
            <div className="quote">
              <div className="quote__intro">
                <p className="sec-num">07 — Заявка</p>
                <h2 id="quote-h">Оставить заявку</h2>
                <p className="t-lead">
                  Перезвоним, ответим на вопросы и договоримся о замере. Замер
                  бесплатный.
                </p>
              </div>

              <div className="quote__form">
                <LeadForm
                  source="home"
                  page="/"
                  submitLabel="Отправить заявку"
                  defaultCity={city}
                />
              </div>

              <div className="quote__aside">
                <dl className="quote__contact">
                  <dt>Телефон</dt>
                  <dd>
                    <a href={phoneHref}>{phone}</a>
                  </dd>
                  <dt>Почта</dt>
                  <dd>
                    <a href={`mailto:${email}`}>{email}</a>
                  </dd>
                  <dt>Часы работы</dt>
                  <dd>{workHours}</dd>
                  <dt>География</dt>
                  <dd>
                    {city} и {region}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 10. FAQ ============ */}
        <section className="section" id="faq" aria-labelledby="faq-h">
          <div className="wrap">
            <div className="faq">
              <div>
                <p className="sec-num">08 — Вопросы</p>
                <h2 id="faq-h" style={{ marginTop: "1rem" }}>
                  Частые вопросы
                </h2>
                <p className="t-lead" style={{ marginTop: "1rem" }}>
                  Не нашли ответ — оставьте заявку, перезвоним.
                </p>
                <div className="btn-row" style={{ marginTop: "1.5rem" }}>
                  <button
                    className="btn btn--primary"
                    type="button"
                    data-lead-open
                  >
                    Задать вопрос
                  </button>
                </div>
              </div>

              <div className="faq__list">
                {FAQ.map((item) => (
                  <details className="faq__item" key={item.q}>
                    <summary>{item.q}</summary>
                    <p className="faq__answer">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ 11. КОНТАКТЫ ============ */}
        <section className="section" id="contacts" aria-labelledby="contacts-h">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">09 — Контакты</p>
                <h2 id="contacts-h">Связаться</h2>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Позвоните или напишите — ответим в течение рабочего дня.
                </p>
              </div>
            </div>

            <div className="contacts">
              <dl className="contacts__list">
                <div className="contacts__row">
                  <dt>Телефон</dt>
                  <dd>
                    <a href={phoneHref}>{phone}</a>
                  </dd>
                </div>
                <div className="contacts__row">
                  <dt>Почта</dt>
                  <dd>
                    <a href={`mailto:${email}`}>{email}</a>
                  </dd>
                </div>
                <div className="contacts__row">
                  <dt>Город</dt>
                  <dd>{city}</dd>
                </div>
                <div className="contacts__row">
                  <dt>География</dt>
                  <dd>{region}</dd>
                </div>
                <div className="contacts__row">
                  <dt>Часы работы</dt>
                  <dd>{workHours}</dd>
                </div>
                <div className="contacts__row">
                  <dt>Юрлицо</dt>
                  <dd>{settings.company_legal ?? companyName}</dd>
                </div>
              </dl>

              <div className="contacts__note">
                <p className="sec-num">География</p>
                <p className="contacts__note-title">
                  {city} и {region}
                </p>
                <p className="t-small muted">
                  Выезжаем на замер в пределах {regionOf(region)}. За пределами
                  обсуждаем отдельно — зависит от расстояния и объёма.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 12. ФИНАЛЬНЫЙ CTA ============ */}
        <section className="cta" aria-labelledby="cta-h">
          <div className="wrap">
            <div className="cta__inner">
              <p className="sec-num" style={{ color: "var(--paper-60)" }}>
                Начнём
              </p>
              <h2 id="cta-h">
                Обсудим ваш <em>ремонт</em>
              </h2>
              <p className="cta__line">
                Перезвоним, ответим на вопросы и договоримся о замере. Замер
                бесплатный.
              </p>
              <div className="cta__actions">
                <button
                  className="btn btn--light btn--lg"
                  type="button"
                  data-lead-open
                >
                  Оставить заявку
                  <svg className="arrow" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      d="M1 6h8M5 2l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <a className="btn btn--outline-light btn--lg" href="#contacts">
                  Все контакты
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={footerSettings} />

      {/* Мобильная панель действий */}
      <Actionbar phoneHref={phoneHref} />

      <LeadModal source="home" page="/" defaultCity={city} />
    </>
  );
}
