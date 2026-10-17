# FRAME

A cinema-inspired movie and TV site built with React and Vite. The site uses self-hosted fonts, TMDB poster/backdrop URLs, and local artwork fallbacks when an image cannot load.

## Run

```sh
npm ci --cache /tmp/npm-cache
npm run dev -- --port 5173
npm run build
npm test
```

Node 24 and npm 11 are available in this environment. Browser tests use system Chromium at `/usr/bin/chromium`.

## Features

- Sixteen curated real movie and TV titles with TMDB/IMDb identifiers, descriptions, directors, and a season/episode metadata snapshot.
- Separate Home, Movies, TV Shows and My List routes (`#home`, `#movies`, `#tv-shows`, `#my-list`). Home links into the catalogs instead of repeating them. Category links support reload and browser history.
- Featured-title navigation, title/director/genre search, independent genre filtering and release-year/alphabetical sorting.
- Saved lists and recently opened titles persisted in browser storage. Data stays in the current browser; there is no account backend.
- Bookmarkable detail links, accessible native dialogs, keyboard dismissal, focus restoration and mobile layouts.
- Movie players, TV season/episode controls, source switching, reload and external-player fallback.
- Six selectable providers: VidSrc, 2Embed, Videasy, PrimeSrc, CloudNestra and VidLink.
- An advanced Playback settings panel for per-provider HTTPS movie and TV URL templates. Supported placeholders: `{id}` (TMDB), `{imdb}`, `{season}` and `{episode}`. Overrides persist in browser storage.

Four default provider URL templates are configured in `src/providers.js`. **Their current endpoint compatibility and actual media playback remain unverified**: provider documentation and player requests returned HTTP/proxy 403 from this cloud environment. PrimeSrc and CloudNestra have no default URL template; configure their documented embed URLs before using them. The UI offers another-source guidance when a source has no template. A loaded iframe does not establish successful playback or content availability. Third-party players may collect visitor information. Only configure sources for content you are authorized to access.

The curated metadata is a static snapshot, not a current release, popularity, rating or streaming-availability feed. To expand it, edit `src/catalog.js` or add a licensed metadata API integration. Poster/backdrop image filenames are stored in `src/catalog.js` and use TMDB’s image CDN. These static image URLs do not require an API key. Live image URLs could not be verified because the cloud proxy blocks `image.tmdb.org`; failed images retain the original local illustrated fallback. The Planet Earth II poster is a local asset sourced from [this public poster example](https://github.com/waleedthedev/Planet-Earth-II), rather than TMDB. Title imagery remains the property of its respective rights holders. Trailer links open a YouTube search for the selected title’s official trailer. TMDB links provide further title information; FRAME is independent and is not endorsed by TMDB.

## Validation

Playwright covers catalog filtering/sorting, list persistence, movie deep links, provider switching, missing-source states, HTTPS template validation and persistence, TV season/episode URL generation, Escape dismissal, TMDB image loading/error fallback, category history, absence of the iframe sandbox attribute, and responsive layouts. Provider network calls are intercepted with controlled test HTML; tests do not claim live third-party streaming works.

Optional tooling installed separately during setup is described in [toolkit installation status](docs/toolkit-installation.md). No external MCP or API key is needed to build or browse FRAME.

## Production deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` runs browser tests, builds with the repository-specific base path, and deploys the `dist` artifact to GitHub Pages whenever `main` changes.

In the repository’s **Settings → Pages**, set **Source** to **GitHub Actions**. If Pages is not enabled, the deployment job cannot publish until that setting is saved. The expected default address is `https://basepumkin34.github.io/chatgpt-site/`; this address is only live after a successful Pages deployment. Custom domains require a separate base-path configuration.

For another static hosting service, use build command `npm run build` and publish directory `dist`. Hash-based title links work without server rewrite rules. The app has no private server credentials or account backend.

The player iframe intentionally has no `sandbox` attribute, as requested. Browser autoplay policy and the provider’s own restrictions still apply.
