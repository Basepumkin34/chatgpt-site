import React, { useState } from "react";
import { Check, RotateCcw, ExternalLink } from "lucide-react";
import { providers, mergeProviders, resolveEmbed } from "./providers";
import { titles } from "./catalog";
export default function Settings({ overrides, onSave }) {
  const [draft, setDraft] = useState(() =>
      Object.fromEntries(
        mergeProviders(overrides).map((p) => [
          p.id,
          { movie: p.movie, tv: p.tv },
        ]),
      ),
    ),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const update = (id, key, value) => {
    setDraft({ ...draft, [id]: { ...draft[id], [key]: value } });
    setSaved(false);
  };
  function submit(e) {
    e.preventDefault();
    try {
      for (const p of mergeProviders(draft)) {
        for (const [key, title] of [
          ["movie", titles[0]],
          ["tv", titles[2]],
        ])
          if (p[key]) resolveEmbed(p, title);
      }
      onSave(draft);
      setSaved(true);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <form className="settings-content" onSubmit={submit}>
      <p className="eyebrow">MAKE YOURSELF AT HOME</p>
      <h2>Playback settings</h2>
      <p className="settings-intro">
        Configure your preferred player sources. Changes are saved in this
        browser.
      </p>
      <details className="template-guide">
        <summary>How player templates work</summary>
        <p>
          Use the provider’s documented HTTPS embed URL. Supported placeholders:{" "}
          <code>{"{id}"}</code> (TMDB), <code>{"{imdb}"}</code>,{" "}
          <code>{"{season}"}</code>, and <code>{"{episode}"}</code>. Only use
          content you’re authorized to access. PrimeSrc and CloudNestra require
          a template from their documentation. Default endpoints have not been
          verified from this environment.
        </p>
      </details>
      {providers.map((p) => (
        <fieldset key={p.id}>
          <legend>
            {p.name}
            <a
              href={p.site}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.name} website`}
            >
              <ExternalLink size={13} />
            </a>
          </legend>
          <label>
            Movie URL
            <input
              aria-label={`${p.name} movie URL`}
              type="text"
              value={draft[p.id].movie}
              placeholder="https://…/{id}"
              onChange={(e) => update(p.id, "movie", e.target.value.trim())}
            />
          </label>
          <label>
            TV URL
            <input
              aria-label={`${p.name} TV URL`}
              type="text"
              value={draft[p.id].tv}
              placeholder="https://…/{id}/{season}/{episode}"
              onChange={(e) => update(p.id, "tv", e.target.value.trim())}
            />
          </label>
        </fieldset>
      ))}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="settings-actions">
        <button className="primary" type="submit">
          <Check size={17} />
          Save settings
        </button>
        <button
          className="secondary"
          type="button"
          onClick={() => {
            setDraft(
              Object.fromEntries(
                providers.map((p) => [p.id, { movie: p.movie, tv: p.tv }]),
              ),
            );
            setSaved(false);
          }}
        >
          <RotateCcw size={15} />
          Reset defaults
        </button>
      </div>
      {saved && (
        <p className="success" role="status">
          Your playback settings have been saved.
        </p>
      )}
    </form>
  );
}
