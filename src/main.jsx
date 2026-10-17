import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Search,
  Plus,
  Check,
  Play,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  ArrowLeft,
  Settings as Gear,
  Bookmark,
  X,
  Clapperboard,
  Film,
  Star,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  seedTitles,
  featureIds,
  titlePath,
  loadCatalog,
  loadTitle,
} from "./catalog";
import { mergeProviders } from "./providers";
import { useStored } from "./storage";
import Artwork from "./Artwork";
import Player from "./Player";
import Settings from "./Settings";
import "./style.css";
const VaultContext = createContext();
const useVault = () => useContext(VaultContext);
function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Recepeit Vault home">
      <span className="brand-symbol">
        <Clapperboard size={22} />
      </span>
      <span>
        recepeit<span>vault</span>
      </span>
      <i />
    </Link>
  );
}
function Shell() {
  const [catalog, setCatalog] = useState({
      titles: seedTitles,
      counts: { movies: 12, tv: 4, total: 16 },
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
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
  const [notice, setNotice] = useState(""),
    [search, setSearch] = useState("");
  const navigate = useNavigate(),
    location = useLocation();
  const refresh = () => {
    setLoading(true);
    setError("");
    loadCatalog()
      .then(setCatalog)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setSearch(new URLSearchParams(location.search).get("q") || "");
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(t);
  }, [notice]);
  const toggle = (t) => {
    setSaved((old) =>
      old.includes(t.id) ? old.filter((x) => x !== t.id) : [...old, t.id],
    );
    setNotice(
      saved.includes(t.id) ? "Removed from your list" : "Added to your list",
    );
  };
  const recordOpened = (id) =>
    setRecent((old) => [id, ...old.filter((x) => x !== id)].slice(0, 20));
  const providers = useMemo(() => mergeProviders(overrides), [overrides]);
  const value = {
    ...catalog,
    loading,
    error,
    refresh,
    saved,
    toggle,
    recent,
    recordOpened,
    providers,
    overrides,
    setOverrides,
  };
  return (
    <VaultContext.Provider value={value}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Brand />
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/movies">Movies</NavLink>
          <NavLink to="/tv">TV Shows</NavLink>
          <NavLink to="/my-list">
            My List
            {saved.length > 0 && (
              <span className="nav-count">{saved.length}</span>
            )}
          </NavLink>
        </nav>
        <form
          className="header-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/search?q=${encodeURIComponent(search.trim())}`);
          }}
        >
          <Search size={17} />
          <input
            aria-label="Search the vault"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the vault"
          />
          <button aria-label="Submit search" type="submit">
            <ArrowUpRight size={16} />
          </button>
        </form>
        <Link
          className="settings-link"
          to="/settings"
          aria-label="Playback settings"
        >
          <Gear size={19} />
        </Link>
      </header>
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Library type="Movies" />} />
          <Route path="/tv" element={<Library type="TV Shows" />} />
          <Route path="/my-list" element={<Library savedOnly />} />
          <Route path="/search" element={<Library search />} />
          <Route path="/movies/:slug" element={<TitlePage type="Movies" />} />
          <Route path="/tv/:slug" element={<TitlePage type="TV Shows" />} />
          <Route
            path="/movies/:slug/watch"
            element={<TitlePage type="Movies" watch />}
          />
          <Route
            path="/tv/:slug/watch"
            element={<TitlePage type="TV Shows" watch />}
          />
          <Route
            path="/settings"
            element={
              <div className="settings-page">
                <Settings overrides={overrides} onSave={setOverrides} />
              </div>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer>
        <Brand />
        <p>Film and television, collected.</p>
        <div className="footer-links">
          <Link to="/movies">Movies</Link>
          <Link to="/tv">TV Shows</Link>
          <Link to="/settings">Player settings</Link>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Recepeit Vault</span>
          <span>
            Metadata & imagery:{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
            >
              TMDB
            </a>{" "}
            · Archival catalog · Independent project
          </span>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
    </VaultContext.Provider>
  );
}
function Card({ title, wide = false }) {
  const { saved, toggle } = useVault();
  return (
    <article className={`title-card ${wide ? "wide-card" : ""}`}>
      <Link
        className="card-art"
        to={titlePath(title)}
        aria-label={`View ${title.name}`}
      >
        <Artwork title={title} kind={wide ? "backdrop" : "poster"} />
        <span className="card-hover">
          <Play size={23} fill="currentColor" />
        </span>
        {title.type === "TV Shows" && <span className="type-tag">SERIES</span>}
      </Link>
      <div className="card-caption">
        <div>
          <Link to={titlePath(title)} className="card-name">
            {title.name}
          </Link>
          <p>
            {title.year || "—"}
            <span>·</span>
            {title.genre}
          </p>
        </div>
        <button
          className={`save-button ${saved.includes(title.id) ? "saved" : ""}`}
          aria-label={`${saved.includes(title.id) ? "Remove" : "Save"} ${title.name}`}
          aria-pressed={saved.includes(title.id)}
          onClick={() => toggle(title)}
        >
          {saved.includes(title.id) ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </article>
  );
}
function Rail({ label, title, items, to, wide = false }) {
  return (
    <section className="rail-section">
      <div className="section-top">
        <div>
          {label && <p className="eyebrow">{label}</p>}
          <h2>{title}</h2>
        </div>
        {to && (
          <Link className="see-all" to={to}>
            Explore all <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      <div className={`rail ${wide ? "landscape-rail" : ""}`}>
        {items.map((t) => (
          <Card key={t.id} title={t} wide={wide} />
        ))}
      </div>
    </section>
  );
}
function Home() {
  const { titles, counts, recent, loading, error, refresh } = useVault();
  const [feature, setFeature] = useState(0);
  const choices = featureIds
    .map((id) => titles.find((t) => t.id === id))
    .filter(Boolean);
  const selected = choices[feature] || choices[0];
  const { saved, toggle } = useVault();
  useEffect(() => {
    document.title = "Recepeit Vault — Movies & TV";
  }, []);
  const recentTitles = recent
    .map((id) => titles.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 8);
  return (
    <>
      <section className="spotlight" aria-label="Featured film">
        <Artwork title={selected} kind="backdrop" priority />
        <div className="spotlight-shade" />
        <div className="spotlight-content" key={selected.id}>
          <p className="eyebrow">
            <span className="status-line" /> IN THE SPOTLIGHT{" "}
            <span className="feature-number">
              0{feature + 1} / 0{choices.length}
            </span>
          </p>
          <h1 aria-label={selected.name}>
            {selected.name === "Dune: Part Two" ? (
              <>
                DUNE<span className="subtitle">PART TWO</span>
              </>
            ) : (
              selected.name
            )}
          </h1>
          <div className="title-meta">
            <span>{selected.year}</span>
            <span>{selected.genre}</span>
            <span>{selected.length}</span>
          </div>
          <p className="feature-description">{selected.description}</p>
          <div className="actions">
            <Link
              className="button primary"
              to={`${titlePath(selected)}/watch`}
            >
              <Play size={17} fill="currentColor" />
              Watch now
            </Link>
            <Link className="button secondary" to={titlePath(selected)}>
              More details <ChevronRight size={16} />
            </Link>
            <button
              className="round-button"
              aria-label={`${saved.includes(selected.id) ? "Remove" : "Save"} featured ${selected.name}`}
              onClick={() => toggle(selected)}
            >
              {saved.includes(selected.id) ? (
                <Check size={19} />
              ) : (
                <Plus size={19} />
              )}
            </button>
          </div>
        </div>
        <div className="spotlight-bottom">
          <span>THE VAULT COLLECTION</span>
          <div>
            <button
              className="round-button"
              aria-label="Previous preview"
              onClick={() =>
                setFeature((feature + choices.length - 1) % choices.length)
              }
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="round-button"
              aria-label="Next preview"
              onClick={() => setFeature((feature + 1) % choices.length)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <section className="preview-section" aria-label="Choose a movie preview">
        <div className="preview-heading">
          <span className="eyebrow">THE SPOTLIGHT SELECTION</span>
          <span>Six films. Select a preview.</span>
        </div>
        <div className="preview-strip">
          {choices.map((t, i) => (
            <button
              key={t.id}
              className={`preview-tile ${feature === i ? "active" : ""}`}
              aria-label={`Preview ${t.name}`}
              aria-pressed={feature === i}
              onClick={() => setFeature(i)}
            >
              <Artwork title={t} kind="backdrop" />
              <span>
                <b>{String(i + 1).padStart(2, "0")}</b>
                {t.name}
              </span>
              <i />
            </button>
          ))}
        </div>
      </section>
      <div className="vault-stats">
        <span className="eyebrow">THE COMPLETE CATALOG</span>
        <span>
          {loading
            ? "Opening the archive…"
            : `${counts.movies.toLocaleString()} movies · ${counts.tv.toLocaleString()} series`}
        </span>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          {error}
          <button onClick={refresh}>Try again</button>
        </div>
      )}
      {recentTitles.length > 0 && (
        <Rail
          label="RECENTLY OPENED"
          title="Back to what caught your eye"
          items={recentTitles}
          wide
        />
      )}
      <Rail
        label="CURATED"
        title="Featured films"
        items={titles.filter((t) => t.type === "Movies").slice(0, 10)}
        to="/movies"
      />
      <Rail
        label="SELECTED SERIES"
        title="Featured series"
        items={titles.filter((t) => t.type === "TV Shows").slice(0, 10)}
        to="/tv"
      />
      <section className="collection-feature">
        <Artwork
          title={titles.find((t) => t.id === "movie-335984") || selected}
          kind="backdrop"
        />
        <div>
          <p className="eyebrow">WORLDS WORTH GETTING LOST IN</p>
          <h2>Science fiction.</h2>
          <p>Distant worlds, alternate realities, and what comes next.</p>
          <Link className="button light-outline" to="/movies?genre=Sci-Fi">
            Explore sci-fi <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <Rail
        label="FROM THE ARCHIVE"
        title="Highly rated by viewers"
        items={titles
          .filter((t) => t.rating >= 8 && t.type === "Movies")
          .slice(0, 10)}
        to="/movies?sort=rating"
      />
    </>
  );
}
function Library({ type, savedOnly = false, search = false }) {
  const { titles, saved, counts, loading, error, refresh } = useVault();
  const [params, setParams] = useSearchParams();
  const genre = params.get("genre") || "All",
    sort = params.get("sort") || "featured",
    query = params.get("q") || "",
    page = Math.max(1, Number(params.get("page")) || 1);
  const title = search ? "Search the vault" : savedOnly ? "My List" : type;
  const genres = useMemo(
    () =>
      [
        "All",
        ...new Set(
          titles
            .filter((t) => !type || t.type === type)
            .flatMap((t) => t.genres || [t.genre]),
        ),
      ].sort((a, b) =>
        a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b),
      ),
    [titles, type],
  );
  useEffect(() => {
    document.title = `${title} — Recepeit Vault`;
  }, [title]);
  const results = useMemo(
    () =>
      titles
        .filter(
          (t) =>
            (!type || t.type === type) &&
            (!savedOnly || saved.includes(t.id)) &&
            (genre === "All" || (t.genres || [t.genre]).includes(genre)) &&
            (!query ||
              `${t.name} ${t.director || ""}`
                .toLowerCase()
                .includes(query.toLowerCase())),
        )
        .sort((a, b) =>
          sort === "rating"
            ? (b.rating || 0) - (a.rating || 0)
            : sort === "newest"
              ? (b.year || 0) - (a.year || 0)
              : sort === "az"
                ? a.name.localeCompare(b.name)
                : 0,
        ),
    [titles, type, savedOnly, saved, genre, query, sort],
  );
  const perPage = 48,
    pages = Math.max(1, Math.ceil(results.length / perPage)),
    current = Math.min(page, pages),
    visible = results.slice((current - 1) * perPage, current * perPage);
  const change = (key, value) => {
    setParams((old) => {
      if (key === "page" && value === "1") old.delete(key);
      else old.set(key, value);
      if (key !== "page") old.delete("page");
      return old;
    });
    if (key === "page") window.scrollTo({ top: 0 });
  };
  return (
    <div className="library-page">
      <div className="library-intro">
        <p className="eyebrow">
          {savedOnly
            ? "YOUR PERSONAL COLLECTION"
            : search
              ? "FIND YOUR NEXT WATCH"
              : "OPEN THE VAULT"}
        </p>
        <h1>
          {title}
          <span>.</span>
        </h1>
        <p>
          {savedOnly
            ? "All the stories you’re saving for a good night."
            : search
              ? `Search across ${counts.total.toLocaleString()} titles.`
              : `${(type === "Movies" ? counts.movies : counts.tv).toLocaleString()} ${type === "Movies" ? "films" : "series"} to explore. Pick a genre. Find your next obsession.`}
        </p>
      </div>
      {search && (
        <form
          className="catalog-search"
          onSubmit={(e) => {
            e.preventDefault();
            change("q", new FormData(e.currentTarget).get("query"));
          }}
        >
          <Search size={20} />
          <input
            name="query"
            aria-label="Search titles"
            placeholder="A title, a director, a favorite…"
            defaultValue={query}
            key={query}
          />
          <button className="button primary">Search</button>
        </form>
      )}
      <div className="library-toolbar">
        <div className="genre-pills" aria-label="Genre filters">
          {["All", "Sci-Fi", "Thriller", "Drama", "Comedy", "Animation"]
            .filter((g) => genres.includes(g))
            .map((g) => (
              <button
                key={g}
                className={genre === g ? "active" : ""}
                aria-pressed={genre === g}
                onClick={() => change("genre", g)}
              >
                {g === "All" ? "All titles" : g}
              </button>
            ))}
        </div>
        <div className="catalog-controls">
          <label className="sr-only" htmlFor="all-genres">
            Genre
          </label>
          <select
            id="all-genres"
            aria-label="Filter by genre"
            value={genre}
            onChange={(e) => change("genre", e.target.value)}
          >
            {genres.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <select
            aria-label="Sort titles"
            value={sort}
            onChange={(e) => change("sort", e.target.value)}
          >
            <option value="featured">Featured order</option>
            <option value="rating">Highest rated</option>
            <option value="newest">Newest first</option>
            <option value="az">A–Z</option>
          </select>
        </div>
      </div>
      <div className="results-summary" aria-live="polite">
        <span>
          {results.length.toLocaleString()} titles
          {genre !== "All" ? ` · ${genre}` : ""}
          {query ? ` for “${query}”` : ""}
        </span>
        <span>
          {loading
            ? "Loading the full archive…"
            : `Page ${current} of ${pages}`}
        </span>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          {error}
          <button onClick={refresh}>Try again</button>
        </div>
      )}
      {visible.length ? (
        <div className="catalog-grid">
          {visible.map((t) => (
            <Card key={t.id} title={t} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Bookmark size={32} />
          <h2>
            {savedOnly
              ? "Your list starts with a little curiosity."
              : "No titles found."}
          </h2>
          <p>
            {savedOnly
              ? "Save a film or series using the + button."
              : "Try a different search or clear your filters."}
          </p>
          <Link className="button secondary" to="/movies">
            Explore movies <ChevronRight size={16} />
          </Link>
        </div>
      )}
      {pages > 1 && (
        <nav className="pagination" aria-label="Catalog pages">
          <button
            disabled={current === 1}
            onClick={() => change("page", String(current - 1))}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span>
            {current} <i>/</i> {pages}
          </span>
          <button
            disabled={current === pages}
            onClick={() => change("page", String(current + 1))}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
function TitlePage({ type, watch = false }) {
  const { slug } = useParams();
  const { titles, loading, saved, toggle, providers, recordOpened } =
    useVault();
  const id = slug?.match(/-(\d+)$/)?.[1];
  const summary = titles.find((t) => t.tmdb === Number(id) && t.type === type);
  const [detail, setDetail] = useState(null),
    [error, setError] = useState("");
  const location = useLocation();
  useEffect(() => {
    setDetail(null);
    setError("");
    if (!summary) return;
    let alive = true;
    loadTitle(summary)
      .then((t) => {
        if (alive) setDetail(t);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [summary?.id, summary?.chunk]);
  const title = detail || summary;
  useEffect(() => {
    document.title = title
      ? `${title.name} — Recepeit Vault`
      : "Recepeit Vault";
  }, [title?.id]);
  if (!title)
    return loading ? (
      <div className="loading-page">
        <span className="spinner" />
        Opening the vault…
      </div>
    ) : (
      <NotFound />
    );
  const related = titles
    .filter(
      (t) =>
        t.id !== title.id &&
        t.type === type &&
        (t.genres || [t.genre]).includes(title.genre),
    )
    .slice(0, 10);
  return (
    <>
      <section className={`title-hero ${watch ? "compact" : ""}`}>
        <Artwork title={title} kind="backdrop" priority />
        <div className="spotlight-shade" />
        <div className="title-page-content">
          <Link
            className="back-link"
            to={type === "Movies" ? "/movies" : "/tv"}
          >
            <ArrowLeft size={15} />
            All {type === "Movies" ? "movies" : "series"}
          </Link>
          <p className="eyebrow">
            {type === "Movies"
              ? "FROM THE FILM VAULT"
              : "A SERIES WORTH YOUR TIME"}
          </p>
          <h1>{title.name}</h1>
          <div className="title-meta">
            <span>{title.year}</span>
            <span>{title.length}</span>
            <span>{title.genre}</span>
            {title.rating > 0 && (
              <span className="rating">
                <Star size={13} fill="currentColor" />
                {title.rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="title-description">
            {title.description ||
              (!detail && summary.chunk
                ? "Loading the synopsis…"
                : "Explore this title in the vault.")}
          </p>
          {error && (
            <p role="alert" className="inline-error">
              {error}
            </p>
          )}
          <div className="actions">
            {watch ? (
              <Link className="button secondary" to={titlePath(title)}>
                <ArrowLeft size={15} />
                Title details
              </Link>
            ) : (
              <Link className="button primary" to={`${titlePath(title)}/watch`}>
                <Play size={17} fill="currentColor" />
                Watch now
              </Link>
            )}
            <button className="button secondary" onClick={() => toggle(title)}>
              {saved.includes(title.id) ? (
                <Check size={17} />
              ) : (
                <Plus size={17} />
              )}{" "}
              {saved.includes(title.id) ? "In My List" : "My List"}
            </button>
            <a
              className="trailer-link"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title.name + " official trailer")}`}
              target="_blank"
              rel="noreferrer"
            >
              Find trailer <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>
      {watch ? (
        <section className="watch-section" aria-label={`${title.name} player`}>
          <Player
            key={title.id}
            title={title}
            providers={providers}
            onOpened={recordOpened}
          />
        </section>
      ) : (
        <section className="detail-facts">
          <div>
            <span>Genres</span>
            <p>{(title.genres || [title.genre]).join(" / ")}</p>
          </div>
          {title.director && (
            <div>
              <span>Directed by</span>
              <p>{title.director}</p>
            </div>
          )}
          <div>
            <span>Release year</span>
            <p>{title.year || "Not listed"}</p>
          </div>
          <div>
            <span>More about this title</span>
            <p>
              <a
                href={`https://www.themoviedb.org/${type === "Movies" ? "movie" : "tv"}/${title.tmdb}`}
                target="_blank"
                rel="noreferrer"
              >
                View on TMDB <ArrowUpRight size={12} />
              </a>
            </p>
          </div>
        </section>
      )}
      <Rail
        label="KEEP EXPLORING"
        title="Related titles"
        items={related}
        to={type === "Movies" ? "/movies" : "/tv"}
      />
    </>
  );
}
function NotFound() {
  return (
    <div className="empty-state not-found">
      <Film size={35} />
      <p className="eyebrow">NOT IN THIS VAULT</p>
      <h1>That title got away.</h1>
      <p>Try another title, or explore the full collection.</p>
      <Link className="button primary" to="/movies">
        Explore movies
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
// Preserve links shared before clean pathname routing was introduced.
const legacy = window.location.hash;
const oldTitle = legacy.match(/^#(movie|tv)\/(\d+)$/);
const legacyTabs = {
  "#home": "/",
  "#movies": "/movies",
  "#tv-shows": "/tv",
  "#my-list": "/my-list",
};
let legacyTarget = legacyTabs[legacy];
if (oldTitle) {
  const t = seedTitles.find(
    (t) =>
      t.tmdb === Number(oldTitle[2]) &&
      t.type === (oldTitle[1] === "movie" ? "Movies" : "TV Shows"),
  );
  if (t) legacyTarget = titlePath(t);
}
if (legacyTarget)
  window.history.replaceState(
    null,
    "",
    `${basename === "/" ? "" : basename}${legacyTarget}`,
  );
createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={basename}>
    <Shell />
  </BrowserRouter>,
);
