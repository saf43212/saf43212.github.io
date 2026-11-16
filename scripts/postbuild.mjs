/**
 * Постобработка статической сборки.
 *
 * GitHub Pages по умолчанию прогоняет файлы через Jekyll, который игнорирует
 * папки, начинающиеся с подчёркивания (`_next`). Пустой `.nojekyll` это
 * выключает. Если в `content/site.ts` указан свой домен, рядом кладём
 * `CNAME` — GitHub Pages привязывает его автоматически. Для технического
 * адреса `*.github.io` CNAME не нужен: он переключил бы сайт на домен,
 * к которому ещё не направлен DNS.
 */
import fs from "node:fs";
import path from "node:path";

const out = path.resolve("out");
if (!fs.existsSync(out)) {
  console.error("нет папки out — сначала должна пройти сборка next build");
  process.exit(1);
}

fs.writeFileSync(path.join(out, ".nojekyll"), "");

const source = fs.readFileSync(path.resolve("content/site.ts"), "utf8");
const match = source.match(/export const siteUrl = "([^"]+)"/);
const url = match?.[1] ?? "";
let host = "";
try {
  host = new URL(url).host;
} catch {
  host = "";
}

const isTechnicalHost = host === "" || host === "linia.example" || host.endsWith(".github.io");
const cname = path.join(out, "CNAME");

if (isTechnicalHost) {
  // Устаревший CNAME от прошлой сборки со своим доменом тоже убираем: иначе
  // GitHub Pages привяжется к домену, который больше не является боевым.
  if (fs.existsSync(cname)) fs.rmSync(cname);
  console.log(`CNAME не создан: технический адрес ${host || "(пусто)"}`);
} else {
  fs.writeFileSync(cname, `${host}\n`);
  console.log(`CNAME: ${host}`);
}

console.log(`.nojekyll: да`);
console.log(`готово: ${out}`);
