# Recepeit Vault

A photographic film and television catalog built with React, Vite and React Router. Artwork uses TMDB image paths, with bundled photographic fallbacks for six featured movies if the image service cannot load. Clicking a catalog image opens a preview popup with synopsis, save controls, Full details and Watch now. Full details opens its named page, for example `/movies/dune-part-two-693134`; Watch now opens the dedicated player page with server selection and reload controls.

## Run locally (Windows, macOS or Linux)

Use Node.js 22 or newer (CI uses Node 24). In the downloaded or cloned project folder:

```sh
npm install
npm run dev
```

Open the address printed by Vite. For reproducible installation, use `npm ci` instead of `npm install`.

## Catalog

The checked-in archive has 10,000 imported movie records and 5,000 imported television records. Merging the curated selection produces **15,007 unique titles: 10,006 movies and 5,001 series**. No API key is needed to browse or search these records.

This is archival metadata, not a live 2026 release feed or a guarantee that a streaming source carries every title. Movie poster filenames are included in the source data. Many TV records lack artwork or per-season episode counts; the interface shows an honest missing-art state and manual episode selection for those records. Known curated series retain their real episode lists. The source datasets, filters and pinned revisions are documented in [catalog sources](docs/catalog-sources.md).

Search and filtering operate across the full index. Only 48 titles render on each catalog page. Full descriptions are fetched in chunks when a title page opens. Saved titles and recently opened titles persist in browser storage, retaining existing users' lists.

## Routes and production

```sh
npm run build
npm run preview
npm test
```

`npm run build` generates a static HTML entry point for every title and watch page, plus `/movies`, `/tv`, `/search`, `/my-list` and `/settings`. The result supports direct navigation and refresh on GitHub Pages without hash-based routing. Old curated hash links redirect to the new paths. This is client-rendered routing with per-page HTML titles, not server-rendered detail content.

The GitHub workflow tests and builds the site for the repository subpath `/chatgpt-site/`, then deploys to GitHub Pages. **Settings → Pages → Source must be GitHub Actions**. A failed Pages deployment does not mean the source code was not pushed. For another static host, build using its appropriate Vite base path and publish `dist`.

## Optional TV artwork enrichment

To retrieve missing artwork and actual season/episode lists, add a TMDB read-access token as the repository's **Actions secret** named `TMDB_READ_TOKEN`. Enrichment is disabled by default, as requested. Normal pushes build the checked-in archive without remote metadata requests. To opt in later, manually run the GitHub workflow with its `enrich_artwork` option enabled. The token is never included in browser JavaScript or catalog JSON.

For local enrichment, set the same variable in your shell or in an ignored `.env.local` file and run:

```sh
npm run catalog:enrich
```

The importer uses four concurrent verified HTTPS requests, stops on authentication/network failures, and writes only public metadata. Missing art may remain if TMDB has no image. Live enrichment is **not verified** in this cloud instance: no token is available and the proxy blocks the TMDB hosts.

## Playback

Three configurable playback options appear as **Server 1** (VidLink, the default), **Server 2** (Videasy), and **Server 3** (VidSrc). Removed sources are no longer registered. Playback pages have a provider selector, TV season/episode controls, reload and an external-player link. The iframe intentionally has no sandbox attribute, as requested. A listed title or loaded iframe does not establish stream availability. Only use content and sources you are authorized to access.

The app has no account backend or private video library. Movie streams are not bundled. Trailer links search YouTube for the official trailer. Actual provider playback remains unverified because the cloud proxy blocks provider hosts.

## Validation and design

Browser tests exercise catalog size, pagination, clean title routes and refresh, searches beyond the curated titles, saved lists, provider URLs, TV controls, source settings, old-link migration, responsive layouts and runtime errors. Provider requests are intercepted with test HTML; these tests do not claim live streaming works. Tests use system Chromium locally when available and Playwright's installed Chromium in CI.

Design references, MCP calls, visual checks, access limitations and UI rules are recorded in [design research](docs/design-update.md). TMDB is the primary image service; bundled fallback photography has source credits in [catalog sources](docs/catalog-sources.md). This independent project is not endorsed or certified by TMDB.

The current shared UI foundations and screen behavior are documented in [the design system](docs/design-system.md). [AIDesigner setup and connection status](docs/aidesigner-setup.md) explains the local MCP configuration and the cloud network blocker.
