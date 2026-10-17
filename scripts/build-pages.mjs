// Produce real static entry points so clean title URLs also refresh on GitHub Pages.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { seedTitles, titlePath } from "../src/catalog.js";
const manifest = JSON.parse(
  await readFile("public/data/catalog-index.json", "utf8"),
);
const titles = new Map(manifest.titles.map((t) => [t.id, t]));
for (const t of seedTitles) titles.set(t.id, t);
const html = await readFile("dist/index.html", "utf8");
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
async function page(path, title) {
  const dir = `dist${path}`;
  await mkdir(dir, { recursive: true });
  await writeFile(
    `${dir}/index.html`,
    html.replace(
      /<title>.*?<\/title>/,
      `<title>${escape(title)} — Recepeit Vault</title>`,
    ),
  );
}
for (const path of ["/movies", "/tv", "/search", "/my-list", "/settings"])
  await page(path, path.slice(1).replace("-", " "));
let count = 0;
for (const title of titles.values()) {
  const path = titlePath(title);
  await page(path, title.name);
  await page(`${path}/watch`, `${title.name} · Watch`);
  count += 2;
}
await writeFile("dist/404.html", html);
await writeFile("dist/.nojekyll", "");
console.log(
  `Created ${count} title/watch entry points for ${titles.size} unique real titles, plus category pages.`,
);
