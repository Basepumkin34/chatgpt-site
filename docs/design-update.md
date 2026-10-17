# Recepeit Vault: design research and implementation

## MCP research, 17 October 2026

The installed servers were invoked through actual MCP stdio clients before implementation:

1. **Design-MCP:** `refero_search_styles` for `Netflix MUBI Apple TV cinematic editorial film streaming` returned 101 matching style systems, including Netflix (`32959012-f50d-4465-bb01-2aa4d506e0a8`), Apple and editorial/media references. A second search for `2026 editorial media film photography` returned additional media/editorial references, including Freshman, Medium, Exhibition Magazine and Monocle. The server advertises an index of 1,340+ design styles. Searching that large index is not a claim to have visually reviewed thousands of screens.
2. **Frontend Design MCP:** `search_designs` for Netflix, MUBI and Apple TV attempted its three catalogs. The providers timed out or returned DNS errors; no result or full design specification was invented.
3. **Open-WebSearch MCP:** a 2026 streaming UI query returned zero results with a blocked Bing connection. Fresh 2026 screenshots/trend claims could not be verified, so this document does not label older references as new 2026 launches.
4. **Playwright MCP:** used for rendered-page inspection and screenshots. Browser tests additionally checked desktop/mobile layouts, real routes and application behavior. Blocked external art and stream requests are distinguished from JavaScript runtime errors.

References available from the style search:

- [Netflix reference](https://styles.refero.design/style/32959012-f50d-4465-bb01-2aa4d506e0a8)
- [Freshman editorial/media reference](https://styles.refero.design/style/a6284fcd-fa69-4469-ac40-4239e5b84a39)
- [Monocle editorial reference](https://styles.refero.design/style/9165ecb1-f068-4093-8783-1f3c98898b8a)

These metadata references informed research; their full live design specifications and screenshot endpoints were inaccessible. The implemented decisions below are explicit design judgments, not falsely quoted reference rules.

## Decisions applied

- **Content before decoration:** original full-width film photography replaces abstract generated-looking landscapes. Six genuine film previews are selectable; no auto-advancing animation steals control.
- **Stable information hierarchy:** brand and primary navigation first; one featured title and its metadata/actions; compact preview selection; clearly named movie/TV collections. Title pages have a synopsis, watch action, list control, real metadata and related titles.
- **Clear navigation:** Home, Movies, TV Shows and My List are normal links. Titles open named pathname routes, not modal overlays or hash fragments. Browser Back, direct links and refresh work, including GitHub Pages static entry points.
- **Restrained visual system:** charcoal surfaces, warm white text, a single vermilion accent, one body family and one display family, consistent 4/8-based spacing, minimal borders and small corner radii. No decorative bento cards or repetitive pill badges.
- **Readable contrast:** primary muted text `#a4a19b` on `#101010` measures 7.38:1; card metadata `#898278` measures 5.01:1. Lower-contrast player/footer labels were raised to a lighter tone. Photo overlays provide text separation, but a blanket WCAG certification is not claimed for every image pixel/state.
- **Usable controls:** primary targets are at least 44px; links have visible focus; the page has a skip link, semantic headings, labeled controls and reduced-motion support. Genre selection and sorting remain independent.
- **Scale without DOM overload:** filter/search the compact real-record index, render 48 results per page, and fetch full details in chunks. Counts and ratings come from the imported records, not made-up popularity or match scores.
- **Honest missing-data states:** no fictional episode totals, no fake image substitutions and no claim that every catalog title has an available stream. Missing TV artwork can be enriched using a secure TMDB token.

## Final playback and image update

Only three playback servers are registered, in fixed order: Server 1 (VidLink, default), Server 2 (Videasy), Server 3 (VidSrc). Old overrides for removed providers are ignored. TMDB image paths are now the primary artwork source; featured local film stills are network-error fallbacks. The archive remains unchanged and automatic enrichment remains disabled. The supplied Frank Mortgage Framer project URL returned HTTP 403 from this environment on October 17, 2026; its visual design could not be inspected or used as a verified reference.

## Catalog preview flow

Catalog image and title clicks now open a native modal quick view without losing search, filters, pagination or scroll. It includes photographic artwork, archival synopsis, metadata, save controls, a full-details link and an explicit Watch now action. Closing via Escape, close button or backdrop restores focus to the originating card. Modified clicks retain normal link behavior. No player is mounted until Watch now is chosen. The dedicated watch route starts with the title and a large player, and provides a browser fullscreen control with a fallback message when fullscreen is unavailable.

The supplied Framer project was retried using the Playwright MCP browser: navigation failed with `net::ERR_TUNNEL_CONNECTION_FAILED`. This implementation follows the user's description of its catalog → preview → player flow; it is not a verified visual clone of the inaccessible project.
