export const providers = [
  {
    id: "vidsrc",
    name: "VidSrc",
    site: "https://vidsrc.sh",
    movie: "https://vidsrc.sh/embed/movie/{id}",
    tv: "https://vidsrc.sh/embed/tv/{id}/{season}/{episode}",
  },
  {
    id: "2embed",
    name: "2Embed",
    site: "https://www.2embed.cc",
    movie: "https://www.2embed.cc/embed/{imdb}",
    tv: "https://www.2embed.cc/embedtv/{imdb}&s={season}&e={episode}",
  },
  {
    id: "videasy",
    name: "Videasy",
    site: "https://videasy.ws",
    movie: "https://player.videasy.net/movie/{id}",
    tv: "https://player.videasy.net/tv/{id}/{season}/{episode}",
  },
  {
    id: "primesrc",
    name: "PrimeSrc",
    site: "https://primesrc.me",
    movie: "",
    tv: "",
  },
  {
    id: "cloudnestra",
    name: "CloudNestra",
    site: "https://cloudnestra.com",
    movie: "",
    tv: "",
  },
  {
    id: "vidlink",
    name: "VidLink",
    site: "https://vidlink.pro",
    movie: "https://vidlink.pro/movie/{id}",
    tv: "https://vidlink.pro/tv/{id}/{season}/{episode}",
  },
];
export function resolveEmbed(provider, title, season = 1, episode = 1) {
  const template = provider?.[title.type === "Movies" ? "movie" : "tv"];
  if (!template) return "";
  const values = { id: title.tmdb, imdb: title.imdb, season, episode };
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
