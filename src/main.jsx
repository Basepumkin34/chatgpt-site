import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/latin-500.css";
import "@fontsource/playfair-display/latin-600.css";
import React, {
  useEffect,
  useMemo,
  useRef,
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
  Film,
  Info,
  Star,
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
import Dialog from "./Dialog";
import Settings from "./Settings";
import "./tokens.css";
import "./style.css";
const VaultContext = createContext();
const useVault = () => useContext(VaultContext);
function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Recepeit Vault home">
      <span className="brand-wordmark">Recepeit Vault</span>
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
  const [preview, setPreview] = useState(null);
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
    setPreview(null);
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
    openPreview: setPreview,
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
            placeholder="Search titles"
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
      {preview && <TitlePreview key={preview.id} summary={preview} onClose={() => setPreview(null)} />}
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
  const { saved, toggle, openPreview } = useVault();
  const previewClick = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openPreview(title);
  };
  return (
    <article className={`title-card ${wide ? "wide-card" : ""}`}>
      <Link
        className="card-art"
        onClick={previewClick}
        aria-haspopup="dialog"
        to={titlePath(title)}
        aria-label={`View ${title.name}`}
      >
        <Artwork title={title} kind={wide ? "backdrop" : "poster"} />
        <span className="card-hover">
          <Info size={20} /><span>Quick view</span>
        </span>
        {title.type === "TV Shows" && <span className="type-tag">SERIES</span>}
      </Link>
      <div className="card-caption">
        <div>
          <Link to={titlePath(title)} className="card-name" onClick={previewClick} aria-haspopup="dialog">
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
function TitlePreview({ summary, onClose }) {
  const { saved, toggle } = useVault();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    loadTitle(summary).then((title) => {
      if (alive) setDetail(title);
    }).catch(() => {
      if (alive) setError("The synopsis couldn’t load. You can still open the title or watch.");
    });
    return () => { alive = false; };
  }, [summary]);
  const title = detail || summary;
  return (
    <Dialog title={`${title.name} preview`} onClose={onClose} wide>
      <div className="preview-image">
        <Artwork title={title} kind="backdrop" priority />
        <span className="preview-image-shade" />
      </div>
      <div className="preview-body">
        <h2>{title.name}</h2>
        <div className="title-meta">
          <span>{title.year || "Year not listed"}</span>
          {title.length && <span>{title.length}</span>}
          <span>{title.genre}</span>
          {title.rating > 0 && <span className="rating"><Star size={13} fill="currentColor" />{title.rating.toFixed(1)}</span>}
        </div>
        <p className="preview-description" aria-live="polite">{title.description || error || (detail ? "Explore this title in the vault." : "Loading the synopsis…")}</p>
        <div className="actions">
          <Link className="button primary" to={`${titlePath(title)}/watch`}><Play size={18} fill="currentColor" />Watch now</Link>
          <button className="button secondary" onClick={() => toggle(title)} aria-pressed={saved.includes(title.id)}>
            {saved.includes(title.id) ? <Check size={18} /> : <Plus size={18} />}{saved.includes(title.id) ? "In My List" : "My List"}
          </button>
          <Link className="preview-details" to={titlePath(title)}>Full details<ArrowUpRight size={16} /></Link>
        </div>
        <p className="preview-genres">{(title.genres || [title.genre]).join(" / ")}</p>
      </div>
    </Dialog>
  );
}
function Rail({ label, title, items, to, wide = false }) {
  const rail = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const element = rail.current;
    const update = () => setEdges({
      start: element.scrollLeft <= 8,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 8,
    });
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { element.removeEventListener("scroll", update); observer.disconnect(); };
  }, [items.length]);
  const scroll = (direction) => rail.current.scrollBy({
    left: direction * rail.current.clientWidth * 0.85,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
  return (
    <section className="rail-section">
      <div className="section-top">
        <div>
          {label && <p className="eyebrow">{label}</p>}
          <h2>{title}</h2>
        </div>
        <div className="rail-tools">
          {to && <Link className="see-all" to={to}>Explore all <ArrowUpRight size={16} /></Link>}
          <div className="rail-arrows">
            <button className="icon-button" aria-label={`Previous ${title}`} disabled={edges.start} onClick={() => scroll(-1)}><ChevronLeft size={19} /></button>
            <button className="icon-button" aria-label={`Next ${title}`} disabled={edges.end} onClick={() => scroll(1)}><ChevronRight size={19} /></button>
          </div>
        </div>
      </div>
      <div ref={rail} className={`rail ${wide ? "landscape-rail" : ""}`} role="region" aria-label={`${title} titles`} tabIndex={0}>
        {items.map((t) => <Card key={t.id} title={t} wide={wide} />)}
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
  const { saved, toggle, openPreview } = useVault();
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
          <p className="eyebrow">Featured film</p>
          <h1>{selected.name}</h1>
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
            <button className="button secondary" onClick={() => openPreview(selected)}>
              <Info size={18} />Quick view
            </button>
            <button
              className="round-button"
              aria-pressed={saved.includes(selected.id)}
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
          <span className="feature-number">{feature + 1} / {choices.length}</span>
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
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </section>
      {error && (
        <div className="inline-error" role="alert">
          {error}
          <button onClick={refresh}>Try again</button>
        </div>
      )}
      <section className="discovery-links" aria-label="Browse by mood">
        <div className="discovery-heading">
          <h2>Browse by mood</h2>
          <div className="vault-stats">
            <span>
              {loading
                ? "Opening the archive…"
                : `${counts.movies.toLocaleString()} movies · ${counts.tv.toLocaleString()} series`}
            </span>
          </div>
        </div>
        <div className="discovery-genres">
          {["Sci-Fi", "Thriller", "Drama", "Comedy"].map((genre) => (
            <Link key={genre} to={`/movies?genre=${encodeURIComponent(genre)}`}>{genre}<ArrowUpRight size={17} /></Link>
          ))}
        </div>
      </section>
      {recentTitles.length > 0 && (
        <Rail
          title="Back to what caught your eye"
          items={recentTitles}
          wide
        />
      )}
      <Rail
        title="Featured films"
        items={choices}
        to="/movies"
        wide
      />
      <Rail
        title="Featured series"
        items={titles.filter((t) => t.type === "TV Shows").slice(0, 10)}
        to="/tv"
      />
      <Rail
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
        <h1>{title}</h1>
        <p>
          {savedOnly
            ? "Save films and series to watch later."
            : search
              ? `Search across ${counts.total.toLocaleString()} titles.`
              : `${(type === "Movies" ? counts.movies : counts.tv).toLocaleString()} ${type === "Movies" ? "films" : "series"}. Browse by genre or sort to find your next watch.`}
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
        <div className="result-actions">
          {(genre !== "All" || query || sort !== "featured") && <button className="clear-filters" onClick={() => setParams({})}><X size={14} />Clear filters</button>}
        <span>
          {loading
            ? "Loading the full archive…"
            : `Page ${current} of ${pages}`}
        </span>
        </div>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          {error}
          <button onClick={refresh}>Try again</button>
        </div>
      )}
      {visible.length ? (
        <div className="catalog-grid" aria-busy={loading}>
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
      {!watch && <section className="title-hero">
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
      </section>}
      {watch ? (
        <section className="watch-section cinema-page" aria-label={`${title.name} player`}>
          <div className="cinema-heading">
            <Link className="back-link" to={titlePath(title)}><ArrowLeft size={17} />Title details</Link>
            <div><p className="eyebrow">NOW WATCHING</p><h1>{title.name}</h1><p className="cinema-meta">{title.year} · {title.genre}{title.length ? ` · ${title.length}` : ""}</p></div>
          </div>
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
