# Toolkit installation status

Installed locally under `/workspace/toolkit`, separate from the FRAME application bundle. The managed chat cannot hot-load these servers: they are registered in a project Codex configuration and a portable configuration, not added to this conversation’s callable tools.

## Use the registered tools

```sh
/workspace/toolkit/codex-with-toolkit mcp list
/workspace/toolkit/codex-with-toolkit
```

The launcher supplies supported Codex configuration overrides and preserves the platform-managed home and authentication. The project-local `.codex/config.toml` can also be read by a future trusted Codex project session. It is excluded from Git because paths refer to this environment snapshot. Generic stdio/HTTP client configuration is `/workspace/toolkit/mcp.json`; it contains no credentials.

## Validation

Twenty local MCP servers passed initialize and list-tools calls. Filesystem listing, memory graph reads, and Playwright navigation to FRAME also passed. Browser navigation reported external-resource errors from the current network policy. Tool listing alone does not establish successful live searches or account access.

| MCP | Validation |
|---|---|
| playwright | Initialize and list-tools passed (25 tools) |
| chrome-devtools | Initialize and list-tools passed (32 tools) |
| context7 | Initialize and list-tools passed (2 tools) |
| filesystem | Initialize and list-tools passed (14 tools) |
| memory | Initialize and list-tools passed (9 tools) |
| sequential-thinking | Initialize and list-tools passed (1 tools) |
| magic-ui | Initialize and list-tools passed (3 tools) |
| spectrum-ui | Initialize and list-tools passed (5 tools) |
| 21st-magic | Installed; blocked by missing API_KEY_21ST |
| open-websearch | Initialize and list-tools passed (6 tools) |
| frontend-design | Initialize and list-tools passed (8 tools) |
| next-devtools | Initialize and list-tools passed (4 tools) |
| shadcn | Initialize and list-tools passed (7 tools) |
| design | Initialize and list-tools passed (13 tools) |
| design-inspiration | Initialize and list-tools passed (4 tools) |
| design-inspiration-toolkit | Initialize and list-tools passed (28 tools) |
| designos | Initialize and list-tools passed (11 tools) |
| git | Initialize and list-tools passed (12 tools) |
| markitdown | Initialize and list-tools passed (1 tools) |
| lookbook | Initialize and list-tools passed (17 tools) |
| skill-retrieval | Initialize and list-tools passed (4 tools) |
| memos | Package installed; registration disabled pending local backend and LLM configuration |
| inspo | Endpoint registered; proxy blocks network access; account authentication may be required |
| a1-gallery | Endpoint registered; proxy blocks network access; account authentication may be required |
| 21st | Endpoint registered; proxy blocks network access; account authentication may be required |
| github | Endpoint registered; proxy blocks network access; account authentication may be required |
| supabase | Endpoint registered; proxy blocks network access; account authentication may be required |
| sentry | Endpoint registered; proxy blocks network access; account authentication may be required |
| uxkin | Endpoint registered; proxy blocks network access; account authentication may be required |

## Skills and component libraries

152 local skill links were installed in `.agents/skills`, from Anthropic, Addy Osmani, Vercel, Superpowers, OpenAI, UXKIN, UIZZE, UI/UX Pro Max, and Design-MCP. All referenced skill contents, support files and notices remain in their source checkouts. Skill Retrieval imported 139 distinct skills. Its package, CPU embedding runtime and MCP server are installed, but vector-index creation is blocked by the Hugging Face model-download domain. It must be retried after network access changes; semantic search is not ready.

React, React DOM, Three.js, React Three Fiber, Motion, Lucide, Radix dialog/dropdown/tabs/tooltip, Tabler Icons, daisyUI and Tailwind are installed in `/workspace/toolkit/libraries`. Copy-distributed React Bits, Magic UI, Motion Primitives, Kokonut UI and Spectrum UI sources are available under `/workspace/toolkit/sources`; these are component catalogs rather than standalone MCP servers. Shadcn and the Magic UI/Spectrum MCPs are installed for component discovery. Components have not all been injected into the website.

Crawl4AI is installed and imports successfully with `CRAWL4_AI_BASE_DIRECTORY=/workspace/toolkit/data/crawl4ai`. Its real crawling workflow has not been validated. MemOS is installed but requires a configured LLM, embedding service and backing databases to become usable; no dummy credentials or empty service substitutes were created.

All 42 unique GitHub repositories are cloned at recorded commits in `/workspace/toolkit/sources.json`. Some use sparse checkouts to retain the relevant source directories without downloading unrelated monorepo contents. Cloning source does not establish a running integration.

## Remaining configuration

- Supply `API_KEY_21ST` and `SERPER_API_KEY` securely through environment settings. Neither is present in the current instance. SERPER powers the YonasValentin design-search tools; those tools list successfully without a key but cannot perform searches.
- Remote A1 Gallery, UXKIN, GitHub, Supabase, Sentry and 21st may require an account login, subscription or API key. Current proxy 403 responses prevent verifying authentication requirements from the running instance. Existing Git read access works and has not been replaced with a requested personal token.
- Network additions are saved in the environment draft. Review/save and publish the environment, then retry the affected requests. Configuration saves do not apply the running network policy.
- MemOS is disabled until backend endpoints, model choices and credentials are configured. Its SDK default expects Neo4j and an embedding/LLM service. The platform reserves OPENAI_-prefixed secret target names; a supported alias and process mapping would be required if that LLM is selected.

## Repeatability

The complete refresh script was executed successfully (exit 0). `/workspace/toolkit/refresh.sh` refreshes npm dependencies from package locks and Python dependencies from generated version locks, and rebuilds the selected source MCPs. Node 22 is retained for DesignOS's native SQLite dependency; the app uses the provided Node 24. The DesignOS launcher invokes its exported main function through tsx and redirects diagnostic console output to stderr, preserving the MCP stdout channel without modifying its application source.

Do not create Git worktrees for ordinary cloud tasks: each task is already isolated. Restore the published environment snapshot to retain these tools and source caches. A fresh-task restoration has not been independently tested.
