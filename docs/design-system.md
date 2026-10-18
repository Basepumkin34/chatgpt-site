# Recepeit Vault design system

## Product brief

A responsive film and television catalog for viewers deciding what to watch. The main journey is discovery → quick preview → explicit playback. It should be easy to compare films, save a title, dismiss a preview without losing one's place, and choose an alternate server if necessary. Preserve the archival dataset, clean title URLs, TMDB image priority and the user's three-server order.

The visual direction is cinematic and restrained: photography carries the personality; a consistent neutral interface makes controls easy to find. This is an implemented React design, not a standalone mockup.

## Evidence and tool provenance

The previous desktop/mobile home, detail and preview screens were inspected before editing. This pass removes redundant uppercase banners, a duplicated promotional section, decorative title punctuation and the boxed genre panel. Six real film previews, the saved list, filters, named routes and native preview-to-player journey remain.

**AIDesigner MCP was actually used.** After the network allowlist was applied, standard OAuth device sign-in completed and authenticated MCP identity was verified. One `generate_design` call with `design_mode: ultradesign` returned remote run `af9cdb80-c8bd-4190-80dd-9098f0f93a5e`. Its reference proposed a near-black canvas, cream Playfair Display titles, Inter body text, muted gold actions and unboxed film rows. The HTML was captured through the official `@aidesigner/agent-skills@0.1.4` CLI into ignored local run `.aidesigner/runs/recepeit-clean-design/`; adoption analysis produced `adoption.json`.

The helper's initial file-URL screenshot was blocked by browser policy. The reference was rendered through local HTTP with its Tailwind styles compiled locally, and scroll-reveal opacity was disabled for inspection. Several example image URLs did not load; the reference's fictional titles, placeholder photographs and mock playback progress were not adopted. Final React screens use the existing real catalog, TMDB image paths, credited fallback film photographs and working player controls.

The **UI UX Designer** skill informed hierarchy and component choices. The **UI Consistency** finding-patterns, values, planning, implementing and verifying workflow was applied once it became available: shared pieces were recorded before UI changes, a separate calibration reviewer detected a deliberately changed action variant in a temporary source copy, fresh agents implemented the Home/Library presentation, and a different independent reviewer checked the whole set. The reviewer found a gold-on-gold text-selection regression; it was corrected to dark text on gold and rechecked in the browser. Calibration proved code-level detection, not rendered geometry; no extra git worktree was created.

Mobbin and Plugin Management were unavailable; no use of those tools is claimed. Earlier Design-MCP research remains in `design-update.md`. Pairing an AIDesigner editor is optional and was not completed; the authenticated design generation did succeed without canvas delivery. Credentials and pairing codes are absent from tracked repository files.

## Foundations

The executable source is [`src/tokens.css`](../src/tokens.css). Component rules consume semantic values rather than maintaining independent palettes.

| Role | Value / rule |
| --- | --- |
| Canvas / surface / raised | `#0a0a0c` / `#111114` / `#1a1b1f` |
| Primary / secondary text | `#e2e2e2` / `#a0a1a6`; headings use `#f4ebd0` |
| Subtle text | `#8b8d91` |
| Accent | `#d4b584`, for selection, focus and restrained emphasis |
| Primary action | Gold text on `#211c15`, with a `#3e3424` border |
| Type | Locally bundled Inter body; Playfair Display headings |
| UI type sizes | 12px metadata, 14px controls, 16px body, 20–32px section headings |
| Display size | Responsive; reserved for the current film or page title |
| Spacing | 4, 8, 12, 16, 24, 32, 48 and 64px |
| Radius | 6px controls/cards; 8px intermediate surfaces; 24px dialogs; full pills for chips, search and circular controls |
| Controls | At least 44px high; dedicated icon buttons at least 44px wide |
| Focus | 2px accent outline with offset; field group border changes on input focus |
| Motion | Short hover transitions; reduced-motion disables animations and smooth scrolling |

Measured contrast on the solid surface is 14.55:1 for primary text, 7.31:1 for secondary text, 5.67:1 for subtle text, and 9.64:1 for the accent. Text contrast is evaluated on the solid canvas/surface backgrounds; text over photographs uses a separate dark scrim. No site-wide WCAG certification is claimed.

## Screens and behavior

- **Home:** one featured story, six user-controlled previews, compact genre entry points with actual catalog counts, then film/series rows. Featured film cards use landscape photography; catalog cards retain poster proportions. Rows have labelled arrows on desktop, horizontal scrolling on touch devices and a keyboard-focusable region. An arrow is disabled when the row reaches its edge.
- **Catalog:** a clear page title, scrollable genre chips, native genre/sort selects, result counts and pagination. Active filters can be cleared in one action; independent genre/sort state remains encoded in the URL.
- **Quick view:** native modal, artwork, title, metadata, synopsis, Watch now, My List and Full details. It mounts no player. Escape, close and backdrop dismissal restore focus to the originating card. The catalog's scroll position and filters remain intact.
- **Title:** a dedicated named route, full synopsis, facts and related titles. Primary action starts playback.
- **Watch:** title context, large player, source buttons, fullscreen/reload controls and optional TV episode selection. Server 1 is VidLink, Server 2 Videasy, Server 3 VidSrc.
- **Settings:** consistent fields, validation, save/reset feedback and labelled server groups.

## States and limits

Focus/hover/selected/disabled treatments use the same control vocabulary throughout. Missing images have a neutral title-labelled state with an explicit “Artwork unavailable” label; photography is never invented. Metadata loading, catalog fetch errors/retry, no search results, empty My List, invalid player templates and fullscreen failures retain their existing recovery actions. A title in the archive does not imply a playable stream, and no progress bars or match percentages are fabricated.

## Validation and maintenance

Browser checks cover the catalog → preview → watch flow, focus restoration, saving, filtering, source switching, fullscreen, direct-route reloads, actual chunk mappings and viewports from 320px to 1440px. Screenshots are captured under `test-results/` locally and are not committed. The final design pass completed 16 browser/data tests successfully and built all 30,014 static title/watch entry points. Desktop preview, mobile catalog and desktop/mobile player screenshots were also inspected. Playback frames in QA used controlled content; actual provider stream availability was not verified.

New components should use existing semantic tokens and controls first. Add a token only for a recurring role, not for one screen. Any change to the catalog or playback flow should retain a keyboard path, a mobile layout and a useful error/empty state.
