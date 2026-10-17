import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Plus,
  Check,
  Play,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Film,
  Settings as SettingsIcon,
  Bookmark,
  Clock,
  X,
  ArrowDownWideNarrow,
} from "lucide-react";
import { titles, featured, genres } from "./catalog";
import { mergeProviders } from "./providers";
import { useStored } from "./storage";
import Dialog from "./Dialog";
import Artwork from "./Artwork";
import Player from "./Player";
import Settings from "./Settings";
import "./style.css";
function Card({ title, saved, toggle, open, rank }) {
  return (
    <article className="card">
      <button
        className="poster"
        onClick={() => open(title)}
        aria-label={`View ${title.name}`}
      >
        <Artwork title={title} />
        <span className="card-tag">
          {title.type === "Movies" ? title.director : "THE COMPLETE STORY"}
        </span>
        {rank && <span className="rank">{String(rank).padStart(2, "0")}</span>}
        <span className="poster-title">{title.name}</span>
        <span className="hover-play">
          <Play fill="currentColor" size={22} />
        </span>
      </button>
      <div className="card-info">
        <div>
          <h3>
            <button onClick={() => open(title)}>{title.name}</button>
          </h3>
          <p>
            {title.year}
            <span>·</span>
            {title.genre}
            <span>·</span>
            {title.type === "Movies" ? "Film" : "Series"}
          </p>
        </div>
        <button
          className={`save ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Remove" : "Save"} ${title.name}`}
          aria-pressed={saved}
          onClick={() => toggle(title.id)}
        >
          {saved ? <Check size={17} /> : <Plus size={17} />}
        </button>
      </div>
    </article>
  );
}
function getLinkedTitle() {
  const key = location.hash.slice(1);
  return (
    titles.find(
      (t) => `${t.type === "Movies" ? "movie" : "tv"}/${t.tmdb}` === key,
    ) || null
  );
}
const browseRoutes = {
  Home: "home",
  Movies: "movies",
  "TV Shows": "tv-shows",
  "My List": "my-list",
};
function getBrowseTab() {
  const route = location.hash.slice(1);
  return (
    Object.keys(browseRoutes).find((key) => browseRoutes[key] === route) ||
    getLinkedTitle()?.type ||
    "Home"
  );
}
function App() {
  const [tab, setTab] = useState(getBrowseTab),
    [query, setQuery] = useState(""),
    [genre, setGenre] = useState("All genres"),
    [sort, setSort] = useState("curated"),
    [slide, setSlide] = useState(0),
    [selected, setSelected] = useState(getLinkedTitle),
    [playing, setPlaying] = useState(false),
    [settings, setSettings] = useState(false),
    [toast, setToast] = useState("");
  const [saved, setSaved] = useStored(
    "frame:saved:v2",
    [],
    (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
  );
  const [recent, setRecent] = useStored(
    "frame:recent:v2",
    [],
    (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
  );
  const [overrides, setOverrides] = useStored(
    "frame:providers:v2",
    {},
    (v) => v && typeof v === "object" && !Array.isArray(v),
  );
  const providers = useMemo(() => mergeProviders(overrides), [overrides]);
  const hero = featured[slide];
  useEffect(() => {
    document.title = selected
      ? `${selected.name} — FRAME`
      : "FRAME — A world worth watching";
  }, [selected]);
  useEffect(() => {
    function sync() {
      setSelected(getLinkedTitle());
      setTab(getBrowseTab());
      setPlaying(false);
    }
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);
  const toggle = (id) => {
    const title = titles.find((t) => t.id === id);
    setSaved((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
    setToast(
      saved.includes(id)
        ? `${title.name} removed from your list`
        : `${title.name} added to your list`,
    );
  };
  function open(title, watch = false) {
    history.pushState(
      null,
      "",
      `#${title.type === "Movies" ? "movie" : "tv"}/${title.tmdb}`,
    );
    setSelected(title);
    setPlaying(watch);
  }
  function close() {
    setSelected(null);
    setPlaying(false);
    history.replaceState(null, "", `#${browseRoutes[tab]}`);
  }
  function navigate(name) {
    if (location.hash !== `#${browseRoutes[name]}`)
      history.pushState(null, "", `#${browseRoutes[name]}`);
    window.scrollTo({ top: 0 });
    setTab(name);
    setQuery("");
    setGenre("All genres");
    setSort("curated");
  }
  function followCategory(event, name) {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    navigate(name);
  }
  useEffect(() => {
    const sync = () => {
      setSelected(getLinkedTitle());
      setTab(getBrowseTab());
      setPlaying(false);
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const filtered = titles
    .filter(
      (t) =>
        (tab === "My List"
          ? saved.includes(t.id)
          : ["Movies", "TV Shows"].includes(tab)
            ? t.type === tab
            : true) &&
        (genre === "All genres" || t.genre === genre) &&
        `${t.name} ${t.director || ""} ${t.genre}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "newest"
        ? b.year - a.year
        : sort === "oldest"
          ? a.year - b.year
          : sort === "az"
            ? a.name.localeCompare(b.name)
            : 0,
    );
  const recentTitles = recent
    .map((id) => titles.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 4);
  const showDiscovery =
    tab === "Home" && !query && genre === "All genres" && sort === "curated";
  const card = (t) => (
    <Card
      key={t.id}
      title={t}
      saved={saved.includes(t.id)}
      toggle={toggle}
      open={open}
    />
  );
  return (
    <>
      <div className="site-shell">
        <header>
          <a
            className="logo"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              navigate("Home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            FRAME<span>●</span>
          </a>
          <nav aria-label="Main navigation">
            {["Home", "Movies", "TV Shows", "My List"].map((n) => (
              <a
                href={`#${browseRoutes[n]}`}
                className={tab === n ? "active" : ""}
                aria-label={n}
                aria-current={tab === n ? "page" : undefined}
                onClick={(e) => followCategory(e, n)}
                key={n}
              >
                {n}
                {n === "My List" && saved.length > 0 && (
                  <span className="list-count">{saved.length}</span>
                )}
              </a>
            ))}
          </nav>
          <div className="header-right">
            <label className="search">
              <Search size={17} />
              <input
                aria-label="Search titles"
                placeholder="Titles, directors, genres"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <button
              className="avatar"
              aria-label="Open playback settings"
              onClick={() => setSettings(true)}
            >
              J
            </button>
          </div>
        </header>
        <main>
          {tab === "Home" && !query && (
            <section className="hero">
              <Artwork title={hero} kind="backdrop" priority />
              <div className="hero-content" key={hero.id}>
                <div className="eyebrow">
                  <span /> A WORLD WORTH WATCHING
                </div>
                <p className="original">
                  THE FRAME COLLECTION{" "}
                  <b>FEATURED {hero.type === "Movies" ? "FILM" : "SERIES"}</b>
                </p>
                <h1 aria-label={hero.name}>
                  {hero.name === "Dune: Part Two" ? (
                    <>
                      DUNE<span className="hero-subtitle">PART TWO</span>
                    </>
                  ) : (
                    hero.name.toUpperCase()
                  )}
                  <span className="hero-period">.</span>
                </h1>
                <div className="metadata">
                  <strong>{hero.genre}</strong>
                  <span>{hero.year}</span>
                  <span>{hero.length}</span>
                  <span className="badge">
                    {hero.type === "Movies" ? "FILM" : "SERIES"}
                  </span>
                </div>
                <p className="synopsis">{hero.description}</p>
                <div className="actions">
                  <button className="primary" onClick={() => open(hero, true)}>
                    <Play size={17} fill="currentColor" />
                    Watch now
                  </button>
                  <button className="secondary" onClick={() => open(hero)}>
                    Explore {hero.type === "Movies" ? "film" : "series"}{" "}
                    <ArrowUpRight size={17} />
                  </button>
                  <button
                    className="circle"
                    aria-label={`${saved.includes(hero.id) ? "Remove" : "Save"} featured ${hero.name}`}
                    onClick={() => toggle(hero.id)}
                  >
                    {saved.includes(hero.id) ? (
                      <Check size={21} />
                    ) : (
                      <Plus size={21} />
                    )}
                  </button>
                </div>
              </div>
              <div className="hero-bottom">
                <span>
                  <span className="live-dot" /> BIG STORIES. A DIFFERENT
                  PERSPECTIVE.
                </span>
                <div className="hero-carousel">
                  <button
                    aria-label="Previous featured title"
                    onClick={() =>
                      setSlide((slide + featured.length - 1) % featured.length)
                    }
                  >
                    <ChevronLeft size={17} />
                  </button>
                  {featured.map((t, i) => (
                    <button
                      key={t.id}
                      className={`slide-dot ${slide === i ? "current" : ""}`}
                      aria-label={`Feature ${t.name}`}
                      aria-pressed={slide === i}
                      onClick={() => setSlide(i)}
                    />
                  ))}
                  <span className="slide-label">
                    0{slide + 1} / 0{featured.length}
                  </span>
                  <button
                    aria-label="Next featured title"
                    onClick={() => setSlide((slide + 1) % featured.length)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
              <span className="hero-side">
                {hero.director?.toUpperCase() || "ONE MORE EPISODE"}
              </span>
            </section>
          )}
          {tab !== "Home" || query ? (
            <section
              className={`catalog ${tab !== "Home" || query ? "catalog-page" : ""}`}
              id="catalog"
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow muted">
                    {tab === "My List"
                      ? "YOUR OWN LITTLE FILM CLUB"
                      : "THE GOOD STUFF, ALL IN ONE PLACE"}
                  </p>
                  <h2>
                    {query
                      ? `Results for “${query}”`
                      : tab === "Home"
                        ? "Find your next obsession"
                        : tab === "My List"
                          ? "Saved for a good night"
                          : tab}
                  </h2>
                </div>
                <div className="filter-controls">
                  <select
                    aria-label="Filter by genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    {genres.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                  <label className="sort-control">
                    <ArrowDownWideNarrow size={15} />
                    <select
                      aria-label="Sort titles"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="curated">Curated order</option>
                      <option value="newest">Newest releases</option>
                      <option value="oldest">Oldest first</option>
                      <option value="az">A–Z</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="collection-tabs" aria-label="Browse genres">
                {[
                  "All genres",
                  "Sci-Fi",
                  "Thriller",
                  "Drama",
                  "Documentary",
                ].map((g) => (
                  <button
                    key={g}
                    aria-pressed={genre === g}
                    className={genre === g ? "chosen" : ""}
                    onClick={() => setGenre(g)}
                  >
                    {g === "All genres" ? "All titles" : g}
                  </button>
                ))}
                <span className="catalog-note">
                  {filtered.length} stories to get lost in
                </span>
              </div>
              {filtered.length ? (
                <div className="grid">
                  {(showDiscovery ? filtered.slice(0, 8) : filtered).map(card)}
                </div>
              ) : (
                <div className="empty">
                  {tab === "My List" ? (
                    <Bookmark size={32} />
                  ) : (
                    <Search size={32} />
                  )}
                  <h3>
                    {tab === "My List" && !query
                      ? "Your next favorites belong here"
                      : "No stories found this time"}
                  </h3>
                  <p>
                    {tab === "My List" && !query
                      ? "Save a film or series with the + button. Your list stays with this browser."
                      : "Try a different title, director, or genre."}
                  </p>
                  <button
                    className="secondary"
                    onClick={() => {
                      navigate("Home");
                      setQuery("");
                    }}
                  >
                    Explore the collection <ChevronRight size={15} />
                  </button>
                </div>
              )}
              {showDiscovery && (
                <button
                  className="view-collection"
                  onClick={() => {
                    setSort("az");
                    document
                      .querySelector("#catalog")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  View the whole collection <ArrowUpRight size={15} />
                </button>
              )}
            </section>
          ) : (
            <section
              className="browse-destinations"
              aria-label="Browse collections"
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow muted">YOUR NEXT GREAT WATCH</p>
                  <h2>What are you in the mood for?</h2>
                </div>
              </div>
              <div className="destination-grid">
                {[
                  {
                    name: "Movies",
                    title: titles[0],
                    text: "Big-screen stories. Your screen.",
                    count: 12,
                  },
                  {
                    name: "TV Shows",
                    title: titles[2],
                    text: "The art of one more episode.",
                    count: 4,
                  },
                ].map((collection) => (
                  <a
                    className="destination"
                    href={`#${browseRoutes[collection.name]}`}
                    onClick={(e) => followCategory(e, collection.name)}
                    key={collection.name}
                  >
                    <Artwork title={collection.title} kind="backdrop" />
                    <div>
                      <span className="eyebrow">
                        {collection.count} TITLES TO EXPLORE
                      </span>
                      <h2>{collection.name}</h2>
                      <p>{collection.text}</p>
                    </div>
                    <ArrowUpRight size={25} />
                  </a>
                ))}
              </div>
            </section>
          )}
          {showDiscovery && (
            <>
              {recentTitles.length > 0 && (
                <section className="catalog extra-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow muted">
                        <Clock size={11} />
                        RECENTLY OPENED
                      </p>
                      <h2>Pick up where curiosity left off</h2>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setRecent([])}
                    >
                      Clear history
                    </button>
                  </div>
                  <div className="grid">{recentTitles.map(card)}</div>
                </section>
              )}
              <section
                className="editorial"
                style={{
                  backgroundImage: `linear-gradient(90deg,#17231df2,#17231d66),url(${import.meta.env.BASE_URL}art/planet-earth.svg)`,
                }}
              >
                <div>
                  <p className="eyebrow">TAKE THE SCENIC ROUTE</p>
                  <h2>
                    There’s a whole world
                    <br />
                    outside your window.
                  </h2>
                  <p>
                    Extraordinary places. Remarkable lives.
                    <br />A little perspective for your next night in.
                  </p>
                  <button
                    onClick={() => {
                      navigate("TV Shows");
                      setGenre("Documentary");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Explore documentaries <ChevronRight size={16} />
                  </button>
                </div>
                <span className="editorial-mark">
                  F<span>●</span>
                </span>
              </section>
            </>
          )}
        </main>
        <footer>
          <a
            className="logo"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              navigate("Home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            FRAME<span>●</span>
          </a>
          <div>
            <p>For the love of stories.</p>
            <p>Curated catalog · Title posters · Third-party players</p>
          </div>
          <button className="footer-settings" onClick={() => setSettings(true)}>
            <SettingsIcon size={14} />
            Playback settings
          </button>
          <p className="image-credit">
            Images provided by{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              TMDB
            </a>
            . This product is not endorsed or certified by TMDB.
          </p>
        </footer>
      </div>
      {selected && (
        <Dialog title={selected.name} onClose={close} wide={playing}>
          {playing ? (
            <>
              <div className="watch-title">
                <button
                  className="text-button"
                  onClick={() => setPlaying(false)}
                >
                  <ChevronLeft size={15} />
                  Back to details
                </button>
                <h2>{selected.name}</h2>
                <p>
                  {selected.year} · {selected.genre} · {selected.length}
                </p>
              </div>
              <Player
                title={selected}
                providers={providers}
                onOpened={(id) =>
                  setRecent((old) =>
                    [id, ...old.filter((x) => x !== id)].slice(0, 8),
                  )
                }
              />
            </>
          ) : (
            <>
              <div className="modal-art">
                <Artwork title={selected} kind="backdrop" priority />
              </div>
              <div className="modal-content">
                <p className="eyebrow">
                  {selected.type === "Movies"
                    ? "THE FRAME FILM COLLECTION"
                    : "ONE MORE EPISODE"}
                </p>
                <h2>{selected.name}</h2>
                <div className="metadata">
                  <strong>{selected.genre}</strong>
                  <span>{selected.year}</span>
                  <span>{selected.length}</span>
                </div>
                <p>{selected.description}</p>
                <div className="actions">
                  <button className="primary" onClick={() => setPlaying(true)}>
                    <Play size={17} fill="currentColor" />
                    Watch now
                  </button>
                  <button
                    className="secondary"
                    onClick={() => toggle(selected.id)}
                  >
                    {saved.includes(selected.id) ? (
                      <Check size={17} />
                    ) : (
                      <Plus size={17} />
                    )}
                    My list
                  </button>
                  <a
                    className="trailer-link"
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selected.name + " " + selected.year + " official trailer")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Find trailer <ArrowUpRight size={14} />
                  </a>
                </div>
                <div className="title-facts">
                  {selected.director && (
                    <p>
                      <span>Directed by</span>
                      {selected.director}
                    </p>
                  )}
                  <p>
                    <span>Collection</span>
                    {selected.genre},{" "}
                    {selected.type === "Movies" ? "Feature film" : "Television"}
                  </p>
                  {selected.seasons && (
                    <p>
                      <span>Seasons</span>
                      {selected.seasons
                        .map((n, i) => `S${i + 1}: ${n} episodes`)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <a
                  className="metadata-link"
                  href={`https://www.themoviedb.org/${selected.type === "Movies" ? "movie" : "tv"}/${selected.tmdb}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  More about this title <ArrowUpRight size={12} />
                </a>
              </div>
            </>
          )}
        </Dialog>
      )}
      {settings && (
        <Dialog title="Playback settings" onClose={() => setSettings(false)}>
          <Settings overrides={overrides} onSave={setOverrides} />
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
