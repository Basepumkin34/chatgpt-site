# Category navigation and artwork update

Before implementation, the installed Design-MCP server was invoked through its MCP stdio interface:

- `refero_search_styles` returned a Netflix dark-media reference, UUID `32959012-f50d-4465-bb01-2aa4d506e0a8`, with Netflix red, dark feature gradients and Netflix Sans metadata. [Reference](https://styles.refero.design/style/32959012-f50d-4465-bb01-2aa4d506e0a8).
- `refero_search_screens` and `refero_get_style` could not retrieve live screens/full specifications because their remote hosts returned DNS/network errors. No reference screenshots were visually inspected.

The implementation preserves FRAME's existing identity while moving to explicit category routes, a small Home entry point, and portrait title art. Home, Movies, TV Shows and My List are separate navigable destinations; existing movie/TV detail links remain supported.

The installed Playwright MCP was used after implementation to navigate the Movies route and capture the rendered layout. Actual TMDB images could not load through the cloud proxy. Automated tests separately verify successful image loading and failure fallback using controlled image responses; these tests do not establish that each live CDN URL resolves.
