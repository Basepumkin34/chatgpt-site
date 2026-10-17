# Recepeit Vault design system

## Product brief

A responsive film and television catalog for viewers deciding what to watch. The main journey is discovery → quick preview → explicit playback. It should be easy to compare films, save a title, dismiss a preview without losing one's place, and choose an alternate server if necessary. Preserve the archival dataset, clean title URLs, TMDB image priority and the user's three-server order.

The visual direction is cinematic and restrained: photography carries the personality; a consistent neutral interface makes controls easy to find. This is an implemented React design, not a standalone mockup.

## Evidence and tool provenance

The previous desktop/mobile home, detail and preview screenshots were inspected before editing. Problems included labels as small as 7–10px, several unrelated warm gray families, inconsistent control surfaces and radii, and horizontal rows without visible desktop controls. Large film stills were effective and are retained.

The available **UI UX Designer** `ui-ux-designer` and `design-system-builder` skills informed the goal-first hierarchy, semantic tokens, 4/8-point spacing, responsive density, minimum 44px controls and state review. Plugin Management, UI Consistency and Mobbin were explicitly requested but are not exposed in this session's tools or skills. No Mobbin screens were retrieved and no output from those three plugins is claimed. Earlier successful Design-MCP research is recorded in `design-update.md`; it is not new Mobbin research.

AIDesigner's published npm package `@aidesigner/agent-skills@0.1.4` was inspected and installed outside the application dependency tree. Its official project bootstrap wrote ignored local Codex configuration pointing to `https://api.aidesigner.ai/api/v1/mcp`. OAuth discovery and an MCP initialize attempt were blocked by the cloud network proxy (HTTP 403 / fetch failure). Pairing has not succeeded, and there is no AIDesigner-generated artifact or credit-spending claim. The pairing code is absent from repository files. Local setup also requires the repository to be trusted in Codex before that client loads its project MCP configuration.

## Foundations

The executable source is [`src/tokens.css`](../src/tokens.css). Component rules consume semantic values rather than maintaining independent palettes.

| Role | Value / rule |
| --- | --- |
| Canvas / surface / raised | `#101112` / `#191b1d` / `#232629` |
| Primary / secondary text | `#f5f3ef` / `#b0b3b6` |
| Subtle text | `#92979b` |
| Accent | `#ff8565`, for selection, focus and restrained emphasis |
| Primary action | Off-white fill and dark text |
| Type | DM Sans body; Manrope headings |
| UI type sizes | 12px metadata, 14px controls, 16px body, 20–32px section headings |
| Display size | Responsive; reserved for the current film or page title |
| Spacing | 4, 8, 12, 16, 24, 32, 48 and 64px |
| Radius | 6px controls; 12px cards; 16px larger surfaces; full pills only for chips and circular controls |
| Controls | At least 44px high; dedicated icon buttons at least 44px wide |
| Focus | 2px accent outline with offset; field group border changes on input focus |
| Motion | Short hover transitions; reduced-motion disables animations and smooth scrolling |

Measured contrast on the solid surface is 15.59:1 for primary text, 8.20:1 for secondary text, 5.86:1 for subtle text, and 7.23:1 for the accent. Text contrast is evaluated on the solid canvas/surface backgrounds; text over photographs uses a separate dark scrim. No site-wide WCAG certification is claimed.

## Screens and behavior

- **Home:** one featured story, six user-controlled previews, a compact catalog count, genre entry points, then film/series rows. Featured film cards use landscape photography; catalog cards retain poster proportions. Rows have labelled arrows on desktop, horizontal scrolling on touch devices and a keyboard-focusable region. An arrow is disabled when the row reaches its edge.
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
