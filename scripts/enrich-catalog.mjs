// Server/build-time only. Credentials are never written to JSON or browser bundles.
import { readFile, writeFile } from "node:fs/promises";
const token = process.env.TMDB_READ_TOKEN;
if (!token) {
  console.log(
    "TMDB_READ_TOKEN is not configured; preserving the archival catalog and available artwork.",
  );
  process.exit(0);
}
const root = "public/data/";
const manifest = JSON.parse(
  await readFile(root + "catalog-index.json", "utf8"),
);
const limit = Math.max(
  0,
  Math.min(10000, Number(process.env.CATALOG_ENRICH_LIMIT) || 5000),
);
const pending = manifest.titles.filter((t) => !t.poster).slice(0, limit);
const patches = new Map();
let cursor = 0,
  stopped = false;
async function worker() {
  while (cursor < pending.length && !stopped) {
    const t = pending[cursor++];
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${t.type === "Movies" ? "movie" : "tv"}/${t.tmdb}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(12000),
        },
      );
      if (response.status === 404) continue;
      if (!response.ok)
        throw Error(
          `TMDB request failed with HTTP ${response.status}; catalog enrichment stopped.`,
        );
      const data = await response.json();
      const patch = {};
      if (data.poster_path) patch.poster = data.poster_path;
      if (data.backdrop_path) patch.backdrop = data.backdrop_path;
      if (data.overview) patch.description = data.overview;
      if (data.seasons?.length) {
        const seasons = data.seasons
          .filter((s) => s.season_number > 0)
          .sort((a, b) => a.season_number - b.season_number);
        if (seasons.every((s, i) => s.season_number === i + 1)) {
          patch.seasons = seasons.map((s) => s.episode_count);
          patch.seasonCount = seasons.length;
          patch.length = `${seasons.length} seasons`;
        }
      }
      patches.set(t.id, patch);
      if (patches.size % 100 === 0)
        console.log(`Enriched ${patches.size} records.`);
      await new Promise((r) => setTimeout(r, 120));
    } catch (error) {
      stopped = true;
      throw Error(
        error.name === "TimeoutError"
          ? "TMDB timed out; enrichment stopped without publishing partial metadata."
          : error.message,
      );
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
const chunkNames = [...new Set(pending.map((t) => t.chunk))];
for (const file of chunkNames) {
  const rows = JSON.parse(await readFile(root + file, "utf8"));
  for (let i = 0; i < rows.length; i++)
    if (patches.has(rows[i].id))
      rows[i] = { ...rows[i], ...patches.get(rows[i].id) };
  await writeFile(root + file, JSON.stringify(rows));
}
manifest.titles = manifest.titles.map((t) => {
  const patch = patches.get(t.id);
  if (!patch) return t;
  const { description, ...indexPatch } = patch;
  return { ...t, ...indexPatch };
});
manifest.artworkEnrichedAt = new Date().toISOString();
await writeFile(root + "catalog-index.json", JSON.stringify(manifest));
console.log(
  `Enriched ${patches.size} records. Missing artwork can remain when TMDB has none.`,
);
