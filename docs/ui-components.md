# UI components

Recepeit Vault uses locally owned components adapted from [shadcn/ui](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui), under the MIT license. Source reviewed: `button.tsx`, `input.tsx`, `dialog.tsx`, `toggle.tsx`, and `toggle-group.tsx` (2026-10-18).

The JavaScript versions in `src/components/ui` retain Button's CVA variant recipe and Radix Slot composition, Input's native form attributes, Radix Dialog's portal/focus trap/dismissal, and ToggleGroup's controlled selection and roving keyboard focus. Their style recipes use semantic CSS in `src/components/ui/ui.css` and the existing `src/tokens.css`, instead of introducing Tailwind or a second theme. This is a source adaptation, not an unmodified CLI installation. `src/lib/utils.js` provides shadcn's `cn` helper.

Main actions and search use Button/Input; the catalog preview uses Dialog; playback servers use ToggleGroup; playback settings use Input/Button. Provider labels/order, named routes, browser-local state and archival metadata remain application-owned. The iframe supports its native fullscreen control; there is no separate fullscreen button below it.

The shadcn MCP was queried for component source and audit guidance. Its registry request was blocked; authoritative source was retrieved from GitHub instead. The 21st HTTP MCP endpoint was also tested, but returned HTTP 401 (missing or reset key). The current cloud draft has no saved `API_KEY_21ST` binding. A fresh key can be entered securely in environment settings with destination `21st.dev`; no 21st generation or component retrieval is claimed for this update. No keys belong in this frontend.
