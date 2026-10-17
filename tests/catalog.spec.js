import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const manifest = JSON.parse(
  readFileSync(
    new URL("../public/data/catalog-index.json", import.meta.url),
    "utf8",
  ),
);
test.beforeEach(async ({ page }) => {
  await page.route("https://image.tmdb.org/**", (r) => r.abort());
  await page.route(
    /https:\/\/(vidsrc\.sh|vidlink\.pro|player\.videasy\.net|player\.example\.com)\//,
    (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Controlled player</title><p>Test player</p>",
      }),
  );
});
test("source catalog contains thousands of unique real movies and series", () => {
  expect(manifest.counts.movies).toBeGreaterThanOrEqual(10000);
  expect(manifest.counts.tv).toBeGreaterThanOrEqual(5000);
  expect(new Set(manifest.titles.map((t) => t.id)).size).toBe(
    manifest.titles.length,
  );
  expect(manifest.titles.find((t) => t.id === "movie-278").name).toBe(
    "The Shawshank Redemption",
  );
  expect(
    manifest.titles.every((t) => Number.isInteger(t.tmdb) && t.slug && t.chunk),
  ).toBe(true);
});
test("brand, full photographic preview and six selectable films", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Recepeit Vault home" }).first(),
  ).toBeVisible();
  await expect(page.locator(".vault-stats")).toContainText("10,006 movies");
  await expect(page.locator(".preview-tile")).toHaveCount(6);
  await expect(page.locator(".spotlight img")).toHaveAttribute(
    "src",
    "/stills/dune.jpg",
  );
  await expect(page.locator(".spotlight img")).toHaveJSProperty(
    "naturalWidth",
    3000,
  );
  await page
    .getByRole("button", { name: "Preview Oppenheimer", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Oppenheimer");
  await expect(page.locator(".spotlight img")).toHaveAttribute(
    "src",
    "/stills/oppenheimer.jpg",
  );
});
test("TMDB is the primary artwork service when it responds", async ({ page }) => {
  await page.route("https://image.tmdb.org/**", (route) =>
    route.fulfill({
      contentType: "image/jpeg",
      body: readFileSync(new URL("../public/stills/dune.jpg", import.meta.url)),
    }),
  );
  await page.goto("/");
  await expect(page.locator(".spotlight img")).toHaveAttribute(
    "src", /^https:\/\/image\.tmdb\.org\/t\/p\/w1280\//,
  );
  await expect(page.locator(".spotlight img")).toHaveJSProperty("naturalWidth", 3000);
});
test("movies are paginated and navigate to a real named title page with reload", async ({
  page,
}) => {
  await page.goto("/movies");
  await expect(page.locator(".results-summary")).toContainText("10,006 titles");
  await expect(page.locator(".catalog-grid .title-card")).toHaveCount(48);
  const first = await page
    .locator(".catalog-grid .card-name")
    .first()
    .innerText();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".catalog-grid .title-card")).toHaveCount(48);
  await expect(page.locator(".catalog-grid .card-name").first()).not.toHaveText(
    first,
  );
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await page
    .getByRole("link", { name: "View Dune: Part Two", exact: true })
    .click();
  await expect(page).toHaveURL(/\/movies$/);
  const preview = page.getByRole("dialog", { name: "Dune: Part Two preview" });
  await expect(preview).toBeVisible();
  await expect(preview.getByRole("heading", { name: "Dune: Part Two" })).toBeVisible();
  await preview.getByRole("link", { name: "Full details" }).click();
  await expect(page).toHaveURL(/\/movies\/dune-part-two-693134$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("h1")).toHaveText("Dune: Part Two");
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Dune: Part Two");
  await page.goBack();
  await expect(page).toHaveURL(/\/movies$/);
});
test("search finds titles outside the curated set and loads a real synopsis", async ({
  page,
}) => {
  await page.goto("/search?q=The%20Shawshank%20Redemption");
  await page
    .getByRole("link", { name: "View The Shawshank Redemption", exact: true })
    .click();
  const preview = page.getByRole("dialog");
  await expect(preview.locator(".preview-description")).toContainText("Framed in the 1940s");
  await preview.getByRole("link", { name: "Full details" }).click();
  await expect(page).toHaveURL(/\/movies\/the-shawshank-redemption-278$/);
  await expect(page.locator(".title-description")).toContainText(
    "Framed in the 1940s",
  );
});
test("saved titles persist and genre filtering is independent of sorting", async ({
  page,
}) => {
  await page.goto("/movies");
  await page
    .getByRole("button", { name: "Save Dune: Part Two", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: /My List/ })
    .click();
  await expect(page.locator(".catalog-grid .title-card")).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "View Dune: Part Two", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Dune: Part Two", exact: true })
    .click();
  await expect(page.locator(".catalog-grid .title-card")).toHaveCount(0);
  await page.goto("/movies?genre=Sci-Fi&sort=rating");
  await expect(page.getByLabel("Filter by genre")).toHaveValue("Sci-Fi");
  await expect(page.getByLabel("Sort titles")).toHaveValue("rating");
  await expect(page.locator(".catalog-grid .title-card")).toHaveCount(48);
});
test("movie watch page switches sources without an iframe sandbox", async ({
  page,
}) => {
  await page.goto("/movies/dune-part-two-693134/watch");
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    "https://vidlink.pro/movie/693134",
  );
  await expect(page.locator("iframe")).not.toHaveAttribute("sandbox");
  await expect(page.locator(".source-tabs button")).toHaveText([
    "Server 1", "Server 2", "Server 3",
  ]);
  await page.getByRole("button", { name: "Server 2", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src", "https://player.videasy.net/movie/693134",
  );
  await page.getByRole("button", { name: "Server 3", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src", "https://vidsrc.sh/embed/movie/693134",
  );
});
test("curated TV episode lists and archival manual episode selection both work", async ({
  page,
}) => {
  await page.goto("/tv/dark-70523/watch");
  await page.getByRole("button", { name: "Episode 10", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    /\/70523\/1\/10$/,
  );
  await page.getByLabel("Season", { exact: true }).selectOption("2");
  await expect(page.locator("iframe")).toHaveAttribute("src", /\/70523\/2\/1$/);
  await expect(
    page.getByRole("button", { name: "Episode 10", exact: true }),
  ).toHaveCount(0);
  // Explicitly exercise incomplete archival metadata even after optional API enrichment.
  const archival = structuredClone(manifest);
  const entry = archival.titles.find((t) => t.id === "tv-71446");
  delete entry.seasons;
  entry.seasonCount = 3;
  await page.route("**/data/catalog-index.json", (route) =>
    route.fulfill({ json: archival }),
  );
  const rows = JSON.parse(
    readFileSync(
      new URL(`../public/data/${entry.chunk}`, import.meta.url),
      "utf8",
    ),
  );
  const record = rows.find((t) => t.id === entry.id);
  delete record.seasons;
  record.seasonCount = 3;
  await page.route(`**/data/${entry.chunk}`, (route) =>
    route.fulfill({ json: rows }),
  );
  await page.goto("/tv/money-heist-71446/watch");
  await expect(page.getByLabel("Episode number")).toBeVisible();
  await page.getByLabel("Episode number").fill("5");
  await expect(page.locator("iframe")).toHaveAttribute("src", /\/71446\/1\/5$/);
});
test("source settings validate HTTPS and persist", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Server 1 movie URL").fill("http://example.com/{id}");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("alert")).toContainText("HTTPS");
  await page
    .getByLabel("Server 1 movie URL")
    .fill("https://player.example.com/{id}");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(
    page.getByText("Your playback settings have been saved."),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Server 1 movie URL")).toHaveValue(
    "https://player.example.com/{id}",
  );
});
test("responsive photographic home and dedicated page render without runtime errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".vault-stats")).toContainText("10,006 movies");
  await page.screenshot({
    path: "test-results/vault-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/vault-mobile.png",
    fullPage: true,
  });
  await page.goto("/movies/dune-part-two-693134");
  await expect(page.locator("h1")).toHaveText("Dune: Part Two");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/vault-title-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("old shared hash links migrate to named title pages", async ({ page }) => {
  await page.goto("/#movie/693134");
  await expect(page).toHaveURL(/\/movies\/dune-part-two-693134$/);
  await expect(page.locator("h1")).toHaveText("Dune: Part Two");
});

test("all catalog records resolve to matching detail chunks without duplicates", () => {
  const chunks = new Map();
  for (const t of manifest.titles) {
    if (!chunks.has(t.chunk))
      chunks.set(
        t.chunk,
        new Map(
          JSON.parse(
            readFileSync(
              new URL(`../public/data/${t.chunk}`, import.meta.url),
              "utf8",
            ),
          ).map((row) => [row.id, row]),
        ),
      );
    const row = chunks.get(t.chunk).get(t.id);
    if (!row || row.tmdb !== t.tmdb || row.name !== t.name)
      throw Error(`Broken detail mapping: ${t.id}`);
  }
  expect(chunks.size).toBe(30);
});

test("preview closes with Escape, restores focus, and opens the watch page", async ({ page }) => {
  await page.goto("/movies?genre=Sci-Fi");
  const card = page.getByRole("link", { name: "View Dune: Part Two", exact: true });
  await card.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(card).toBeFocused();
  await expect(page).toHaveURL(/genre=Sci-Fi/);
  await card.click();
  await page.getByRole("dialog").getByRole("link", { name: "Watch now" }).click();
  await expect(page).toHaveURL(/dune-part-two-693134\/watch$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveAttribute("src", "https://vidlink.pro/movie/693134");
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
});

test("mobile preview fits the viewport and saves without starting playback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/movies");
  await page.getByRole("link", { name: "View Dune: Part Two", exact: true }).click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "My List", exact: true }).click();
  await expect(modal.getByRole("button", { name: "In My List", exact: true })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(await modal.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: "test-results/vault-preview-mobile.png" });
  await modal.getByRole("button", { name: "Close dialog" }).click();
  await expect(modal).toHaveCount(0);
});
