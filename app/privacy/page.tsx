import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Как «ЛИНИЯ» обрабатывает персональные данные, оставленные в формах на сайте: цели, сроки, права пользователя.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default async function PrivacyPage() {
  const settings = await getSettings();

  const companyName = settings.company_name ?? "ЛИНИЯ";
  const companyLegal = settings.company_legal ?? companyName;
  const city = settings.city ?? "Кисловодск";
  const region = settings.region ?? "Кавказские Минеральные Воды";
  const phone = settings.phone || "+7 928 000-00-00";
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const email = settings.form_email || settings.email || "hello@linia.example";

  return (
    <>
      <Header settings={{ companyName, phone, phoneHref }} />

      <main id="top">
        <section className="section" aria-labelledby="privacy-h">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-head__title">
                <p className="sec-num">Документы</p>
                <h1 id="privacy-h">Политика конфиденциальности</h1>
              </div>
              <div className="sec-head__aside">
                <p className="t-lead">
                  Коротко и по делу: какие данные мы собираем, зачем и как их
                  защищаем. Если что-то непонятно — напишите нам.
                </p>
              </div>
            </div>

            <div className="about__body" style={{ maxWidth: "62ch" }}>
              <div>
                <h3>1. Кто обрабатывает данные</h3>
                <p>
                  Оператор персональных данных — {companyLegal}. Связаться можно
                  по почте <a href={`mailto:${email}`}>{email}</a>.
                </p>
              </div>

              <div>
                <h3>2. Какие данные мы собираем</h3>
                <p>
                  Только то, что вы сами указали в форме: имя, телефон, почту
                  (если указали), город и текст сообщения. Для расчёта в
                  калькуляторе — площадь, тип работ и помещения. Эти данные не
                  персональные, но мы храним их вместе с заявкой, чтобы понять
                  задачу.
                </p>
              </div>

              <div>
                <h3>3. Зачем</h3>
                <p>
                  Чтобы связаться с вами по заявке, уточнить задачу,
                  договориться о замере и подготовить смету. Мы не используем
                  ваши данные для рассылок без отдельного согласия и не продаём
                  их третьим лицам.
                </p>
              </div>

              <div>
                <h3>4. Как храним и защищаем</h3>
                <p>
                  Данные хранятся в базе на сервере под контролем доступа.
                  Доступ к заявкам — только у администраторов. Передача данных
                  между вашим браузером и сайтом защищена HTTPS.
                </p>
              </div>

              <div>
                <h3>5. Сколько храним</h3>
                <p>
                  Пока это нужно для работы по заявке, но не дольше, чем
                  требуется по закону. Вы можете попросить удалить данные — мы
                  сделаем это, если нет законных оснований их хранить.
                </p>
              </div>

              <div>
                <h3>6. Ваши права</h3>
                <p>
                  Вы можете запросить, какие данные о вас есть, исправить их или
                  отозвать согласие на обработку. Напишите на{" "}
                  <a href={`mailto:${email}`}>{email}</a> — ответим в течение
                  рабочего дня.
                </p>
              </div>

              <div>
                <h3>7. Cookies</h3>
                <p>
                  Сайт не использует рекламные или аналитические cookies. Форма
                  отправляет данные напрямую на сервер. Если вы авторизованы в
                  админке, используется техническая cookie сессии.
                </p>
              </div>

              <p className="t-small muted">
                Документ носит информационный характер и требует юридической
                проверки перед публикацией.
              </p>
            </div>

            <p style={{ marginTop: "40px" }}>
              <Link className="link" href="/">
                Вернуться на главную
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer
        settings={{
          companyName,
          companyLegal,
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
