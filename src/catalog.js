import {
  titles as curatedTitles,
  imageUrl as curatedImage,
} from "./curated.js";
export const seedTitles = curatedTitles.map((t) => ({
  ...t,
  genres: [t.genre],
  slug: slugify(t.name) + "-" + t.tmdb,
}));
export const featureIds = [
  "movie-693134",
  "movie-872585",
  "movie-335984",
  "movie-157336",
  "movie-27205",
  "movie-414906",
];
export const localStills = {
  "movie-693134": "dune.jpg",
  "movie-872585": "oppenheimer.jpg",
  "movie-335984": "blade-runner-full.png",
  "movie-157336": "interstellar.jpg",
  "movie-27205": "inception.jpg",
  "movie-414906": "batman.png",
};
export function slugify(name) {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "title"
  );
}
export function titlePath(t) {
  return `/${t.type === "Movies" ? "movies" : "tv"}/${t.slug || slugify(t.name) + "-" + t.tmdb}`;
}
export function photoUrl(t, kind = "poster") {
  if (t.poster)
    return `https://image.tmdb.org/t/p/${kind === "poster" ? "w500" : "w1280"}${t.backdrop && kind === "backdrop" ? t.backdrop : t.poster}`;
  if (t.art) {
    const image = curatedImage(t, kind);
    if (image.startsWith("https://image.tmdb.org/")) return image;
  }
  return "";
}
export function fallbackPhotoUrl(t) {
  return localStills[t.id]
    ? `${import.meta.env.BASE_URL}stills/${localStills[t.id]}`
    : "";
}
let indexPromise;
export function loadCatalog() {
  if (!indexPromise)
    indexPromise = fetch(`${import.meta.env.BASE_URL}data/catalog-index.json`)
      .then((r) => {
        if (!r.ok) throw Error("The catalog could not be loaded.");
        return r.json();
      })
      .then((data) => {
        const merged = new Map(data.titles.map((t) => [t.id, t]));
        for (const seed of seedTitles)
          merged.set(seed.id, { ...merged.get(seed.id), ...seed });
        const titles = [
          ...seedTitles.map((s) => merged.get(s.id)),
          ...[...merged.values()].filter(
            (t) => !seedTitles.some((s) => s.id === t.id),
          ),
        ];
        return {
          titles,
          counts: {
            movies: titles.filter((t) => t.type === "Movies").length,
            tv: titles.filter((t) => t.type === "TV Shows").length,
            total: titles.length,
          },
        };
      })
      .catch((e) => {
        indexPromise = undefined;
        throw e;
      });
  return indexPromise;
}
const chunks = new Map();
export function loadTitle(t) {
  if (t.description || !t.chunk) return Promise.resolve(t);
  if (!chunks.has(t.chunk))
    chunks.set(
      t.chunk,
      fetch(`${import.meta.env.BASE_URL}data/${t.chunk}`)
        .then((r) => {
          if (!r.ok) throw Error("Title details could not be loaded.");
          return r.json();
        })
        .catch((e) => {
          chunks.delete(t.chunk);
          throw e;
        }),
    );
  return chunks
    .get(t.chunk)
    .then((rows) => ({ ...t, ...rows.find((row) => row.id === t.id) }));
}
