import React, { useEffect, useState, useRef } from "react";
import {
  ExternalLink,
  Maximize,
  RefreshCw,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { resolveEmbed } from "./providers";
export default function Player({ title, providers, onOpened }) {
  const screen = useRef(null);
  const [fullscreenError, setFullscreenError] = useState("");
  const [source, setSource] = useState(
    () =>
      providers.find((p) => p[title.type === "Movies" ? "movie" : "tv"])?.id ||
      providers[0].id,
  );
  const [season, setSeason] = useState(1),
    [episode, setEpisode] = useState(1),
    [retry, setRetry] = useState(0),
    [loading, setLoading] = useState(true);
  const provider = providers.find((p) => p.id === source);
  let url = "",
    error = "";
  try {
    url = resolveEmbed(provider, title, season, episode);
  } catch (e) {
    error = e.message;
  }
  useEffect(() => {
    setLoading(true);
    if (url) onOpened(title.id);
  }, [url, retry]);
  const isTV = title.type === "TV Shows";
  const seasons =
    title.seasons ||
    Array.from({ length: Math.min(100, title.seasonCount || 1) }, () => null);
  const episodes = isTV ? seasons[season - 1] : 0;
  function next() {
    if (!episodes || episode < episodes) setEpisode(episode + 1);
    else if (season < seasons.length) {
      setSeason(season + 1);
      setEpisode(1);
    }
  }
  return (
    <div className="watch-player">
      <div className="player-screen" ref={screen}>
        {url ? (
          <>
            <iframe
              key={`${url}-${retry}`}
              title={`${title.name} — ${provider.name}`}
              src={url}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="no-referrer"
              onLoad={() => setLoading(false)}
            />
            {loading && (
              <div className="player-loading" aria-live="polite">
                <span className="spinner" />
                <span>Connecting to {provider.name}…</span>
              </div>
            )}
          </>
        ) : (
          <div className="player-empty">
            <Play size={35} />
            <h3>This source isn’t available yet</h3>
            <p>{error || "Choose another source below to start watching."}</p>
          </div>
        )}
      </div>
      {fullscreenError && <p role="status" className="episode-note">{fullscreenError}</p>}
      <div className="source-heading">
        <div>
          <span className="eyebrow muted">CHOOSE YOUR SOURCE</span>
          <p>Player not loading? Try another source.</p>
        </div>
        <button className="button secondary" onClick={async () => {
          setFullscreenError("");
          try {
            if (!screen.current?.requestFullscreen) throw new Error();
            await screen.current.requestFullscreen();
          } catch {
            setFullscreenError("Use the player’s fullscreen control or open the player in a new tab.");
          }
        }}><Maximize size={17} />Fullscreen</button>
        <button
          className="icon-button"
          aria-label="Reload player"
          onClick={() => setRetry(retry + 1)}
        >
          <RefreshCw size={17} />
        </button>
      </div>
      <div className="source-tabs" aria-label="Playback source">
        {providers.map((p) => (
          <button
            aria-pressed={source === p.id}
            className={source === p.id ? "selected" : ""}
            key={p.id}
            onClick={() => setSource(p.id)}
          >
            <span
              className={
                p[isTV ? "tv" : "movie"] ? "source-dot" : "source-dot offline"
              }
            />
            {p.name}
          </button>
        ))}
      </div>
      {isTV && (
        <div className="episodes">
          <div className="episode-heading">
            <label>
              Season
              <select
                aria-label="Season"
                value={season}
                onChange={(e) => {
                  setSeason(Number(e.target.value));
                  setEpisode(1);
                }}
              >
                {seasons.map((_, i) => (
                  <option key={i} value={i + 1}>
                    Season {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <span>
              Episode {episode}
              {episodes ? ` of ${episodes}` : ""}
            </span>
            <div className="episode-arrows">
              <button
                className="icon-button"
                disabled={episode === 1}
                aria-label="Previous episode"
                onClick={() => setEpisode(episode - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                disabled={episode === episodes && season === seasons.length}
                aria-label="Next episode"
                onClick={next}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          {!episodes && (
            <>
              <label className="episode-heading">
                Episode{" "}
                <input
                  aria-label="Episode number"
                  type="number"
                  min="1"
                  max="9999"
                  value={episode}
                  onChange={(e) =>
                    setEpisode(
                      Math.min(9999, Math.max(1, Number(e.target.value) || 1)),
                    )
                  }
                />
              </label>
              <p className="episode-note">
                Episode lists aren’t included in this archive record. Choose the
                season and enter the episode number.
              </p>
            </>
          )}
          <div className="episode-grid">
            {Array.from({ length: episodes || 0 }, (_, i) => (
              <button
                key={i}
                className={episode === i + 1 ? "selected" : ""}
                aria-label={`Episode ${i + 1}`}
                aria-pressed={episode === i + 1}
                onClick={() => setEpisode(i + 1)}
              >
                <Play size={12} />
                <span>{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="player-help">
        <span>
          Playback is provided by {provider.name}. Availability varies by
          source.
        </span>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Open player <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
