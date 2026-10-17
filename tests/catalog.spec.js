import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.route(
    /https:\/\/(vidsrc\.sh|vidlink\.pro|www\.2embed\.cc|player\.videasy\.net)\//,
    (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<html><body>Controlled test player</body></html>",
      }),
  );
});
test("search, independent genre and sort controls, and persisted list", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".card")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Movies", exact: true })
    .click();
  await expect(page).toHaveURL(/#movies$/);
  await expect(page.locator(".card")).toHaveCount(12);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "TV Shows", exact: true })
    .click();
  await expect(page.locator(".card")).toHaveCount(4);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await page.getByLabel("Search titles").fill("interstellar");
  await expect(page.locator(".card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Save Interstellar", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "My List", exact: true })
    .click();
  await expect(page.locator(".card")).toHaveCount(1);
  await page.reload();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "My List", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "View Interstellar" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Interstellar", exact: true })
    .click();
  await expect(page.getByText("Your next favorites belong here")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Movies", exact: true })
    .click();
  await page.getByLabel("Filter by genre").selectOption("Sci-Fi");
  await expect(page.locator(".card")).toHaveCount(4);
  await page.getByLabel("Sort titles").selectOption("newest");
  await expect(page.locator(".card h3").first()).toHaveText("Dune: Part Two");
  await expect(page.getByLabel("Filter by genre")).toHaveValue("Sci-Fi");
});
test("movie deep links, player source switching, unavailable source, and Escape dismissal", async ({
  page,
}) => {
  await page.goto("/#movie/693134");
  await expect(
    page.getByRole("dialog", { name: "Dune: Part Two" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Watch now", exact: true })
    .click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    "https://vidsrc.sh/embed/movie/693134",
  );
  await expect(page.locator("iframe")).not.toHaveAttribute("sandbox");
  await page.getByRole("button", { name: "VidLink", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    "https://vidlink.pro/movie/693134",
  );
  await page.getByRole("button", { name: "PrimeSrc", exact: true }).click();
  await expect(page.getByText("This source isn’t available yet")).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/#movies$/);
});
test("TV player uses real season and episode IDs, resets episode on season change", async ({
  page,
}) => {
  await page.goto("/#tv/70523");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Watch now", exact: true })
    .click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    "https://vidsrc.sh/embed/tv/70523/1/1",
  );
  await page.getByRole("button", { name: "Episode 10", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /\/1\/10$/);
  await page.getByLabel("Season", { exact: true }).selectOption("2");
  await expect(page.locator("iframe")).toHaveAttribute("src", /\/2\/1$/);
  await expect(
    page.getByRole("button", { name: "Episode 10", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Next episode", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /\/2\/2$/);
});
test("custom provider templates validate, persist and resolve title placeholders", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Playback settings", exact: true })
    .click();
  await page.getByLabel("PrimeSrc movie URL").fill("http://example.com/{id}");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("alert")).toContainText("HTTPS");
  await page
    .getByLabel("PrimeSrc movie URL")
    .fill("https://player.example.com/movie/{id}");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(
    page.getByText("Your playback settings have been saved."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.reload();
  await page
    .getByRole("button", { name: "Playback settings", exact: true })
    .click();
  await expect(page.getByLabel("PrimeSrc movie URL")).toHaveValue(
    "https://player.example.com/movie/{id}",
  );
});
test("desktop and mobile render local artwork without console errors or overflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://image.tmdb.org/**", (route) => route.abort());
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Dune: Part Two", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next featured title" }).click();
  await expect(page.locator("h1")).toHaveText("INTERSTELLAR.");
  await page
    .getByRole("button", { name: "Feature Dune: Part Two", exact: true })
    .click();
  await page
    .locator(".hero-content")
    .evaluate((el) =>
      Promise.all(el.getAnimations().map((animation) => animation.finished)),
    );
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await expect(page.locator(".hero .artwork")).toHaveCSS(
    "background-image",
    /\/art\/dune.svg/,
  );
  expect(errors).toEqual([]);
});

test("category links survive reload and browser history", async ({ page }) => {
  await page.goto("/#movies");
  await expect(page.locator(".card")).toHaveCount(12);
  await page.reload();
  await expect(
    page
      .getByRole("navigation")
      .getByRole("link", { name: "Movies", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "TV Shows", exact: true })
    .click();
  await expect(page).toHaveURL(/#tv-shows$/);
  await expect(page.locator(".card")).toHaveCount(4);
  await page.goBack();
  await expect(page).toHaveURL(/#movies$/);
  await expect(page.locator(".card")).toHaveCount(12);
});
test("posters use TMDB images and fall back cleanly when the host fails", async ({
  page,
}) => {
  await page.route("https://image.tmdb.org/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect width="500" height="750" fill="teal"/></svg>',
    }),
  );
  await page.goto("/#movies");
  const first = page.locator(".poster").first();
  await expect(first.locator("img")).toHaveAttribute(
    "src",
    /^https:\/\/image\.tmdb\.org\/t\/p\/w500\//,
  );
  await expect(first.locator("img")).toHaveAttribute("data-loaded", "true");
  await expect(first.locator(".poster-title")).toBeHidden();
  await page.unroute("https://image.tmdb.org/**");
  await page.route("https://image.tmdb.org/**", (route) => route.abort());
  await page.reload();
  await expect(first.locator("img")).toBeHidden();
  await expect(first.locator(".poster-title")).toBeVisible();
});
