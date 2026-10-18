# AIDesigner connection status

The cloud workspace has the published `@aidesigner/agent-skills@0.1.4` helper installed outside the application's dependencies. Its Codex project setup has been saved in ignored `.codex/config.toml` with this endpoint:

```text
https://api.aidesigner.ai/api/v1/mcp
```

**The authenticated MCP connection is now verified.** The original HTTP 403 blocker was resolved by applying environment allowlist additions for `aidesigner.ai`, `www.aidesigner.ai` and `api.aidesigner.ai`. OAuth device sign-in succeeded, `whoami` confirmed authentication, and `generate_design` successfully returned the reference used for the clean design pass. See `design-system.md` for the run and adoption evidence.

The cloud's global Codex configuration is read-only, so `--trust-project` could not persist its trust entry. A supported Streamable HTTP MCP client with OAuth device authorization was used in this cloud session instead. Credentials are stored privately outside the checkout, not in frontend code, GitHub source or generated design artifacts. Authentication must not be assumed to survive a fresh cloud task.

Editor pairing is separate from OAuth: after sign-in, `link_editor_session` accepts a fresh six-character code from the editor's Connect Agent control. Those codes expire after 10 minutes. The supplied pairing codes were rejected as invalid, expired or already used, so no editor was linked. Pairing is optional for generation; the successful reference was returned directly to the agent without editor-canvas delivery.

## Connect from your own Codex installation

From the repository folder, install the official project configuration:

```sh
npx -y @aidesigner/agent-skills init codex
```

Open the project in Codex, trust the project if prompted, and start a fresh session. Then complete the service's browser sign-in using:

```sh
codex mcp login aidesigner
```

Verify the setup with:

```sh
npx -y @aidesigner/agent-skills doctor codex
```

On a remote/headless machine use the service’s OAuth device-authorization flow where supported by the client. An editor pairing code is passed to `link_editor_session` after OAuth; it is not an API key or a substitute for browser sign-in. Credentials should remain in the client's credential storage. Do not add them to frontend environment variables or GitHub source.

The package's published documentation is at https://www.npmjs.com/package/@aidesigner/agent-skills . Configuration and authentication may change in future releases.
