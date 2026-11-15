"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <main id="top" className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-head__title">
            <p className="sec-num">Ошибка</p>
            <h1>Что-то пошло не так</h1>
          </div>
          <div className="sec-head__aside">
            <p className="t-lead">
              Страница не загрузилась. Попробуйте обновить — или вернитесь на
              главную.
            </p>
          </div>
        </div>
        <div className="btn-row" style={{ marginTop: "2rem" }}>
          <button className="btn btn--primary" type="button" onClick={reset}>
            Попробовать снова
          </button>
          <Link className="btn btn--ghost" href="/">
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
