export const providers = [
  {
    id: "vidlink",
    name: "Server 1",
    site: "https://vidlink.pro",
    movie: "https://vidlink.pro/movie/{id}",
    tv: "https://vidlink.pro/tv/{id}/{season}/{episode}",
  },
  {
    id: "videasy",
    name: "Server 2",
    site: "https://videasy.ws",
    movie: "https://player.videasy.net/movie/{id}",
    tv: "https://player.videasy.net/tv/{id}/{season}/{episode}",
  },
  {
    id: "vidsrc",
    name: "Server 3",
    site: "https://vidsrc.sh",
    movie: "https://vidsrc.sh/embed/movie/{id}",
    tv: "https://vidsrc.sh/embed/tv/{id}/{season}/{episode}",
  },
];
export function resolveEmbed(provider, title, season = 1, episode = 1) {
  const template = provider?.[title.type === "Movies" ? "movie" : "tv"];
  if (!template) return "";
  const values = { id: title.tmdb, imdb: title.imdb, season, episode };
  if (template.includes("{imdb}") && !title.imdb) return "";
  const result = template.replace(/\{(id|imdb|season|episode)\}/g, (_, key) =>
    encodeURIComponent(values[key]),
  );
  const url = new URL(result);
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("Use an HTTPS player URL without embedded credentials.");
  if (/[{}]/.test(result))
    throw new Error("The player template contains an unknown placeholder.");
  return url.href;
}
export function mergeProviders(overrides) {
  return providers.map((p) => ({
    ...p,
    ...overrides?.[p.id],
    id: p.id,
    name: p.name,
    site: p.site,
  }));
}
