/**
 * Монтаж момента (dealt moment) на странице.
 * React 19 поднимает <link> в <head>; скрипты выполняются после гидрации.
 */
import Script from "next/script";

export function Moment({ id }: { id: "photo-chapters" | "word-highlight" }) {
  return (
    <>
      <link rel="stylesheet" href={`/assets/moments/${id}/moment.css`} />
      <link rel="modulepreload" href="/assets/moments/moments.js" />
      <link rel="modulepreload" href="/assets/moments/lib.js" />
      <link rel="modulepreload" href={`/assets/moments/${id}/moment.js`} />
      <Script src="/assets/moments/moments.js" strategy="afterInteractive" />
    </>
  );
}

/** Гварды для моментов и анимаций (как в starter.html) */
export function MotionGuards() {
  return (
    <Script id="mo-guards" strategy="beforeInteractive">
      {`document.documentElement.classList.add('mo-js');setTimeout(function(){document.documentElement.classList.add('mo-safe')},2500);document.documentElement.classList.add('m-enter');setTimeout(function(){document.documentElement.classList.add('m-enter-done')},700);`}
    </Script>
  );
}
