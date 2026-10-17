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
  await expect(page.locator(".card")).toHaveCount(12);
  await page.getByRole("button", { name: "TV Shows", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(4);
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await page.getByLabel("Search titles").fill("interstellar");
  await expect(page.locator(".card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Save Interstellar", exact: true })
    .click();
  await page.getByRole("button", { name: "My List", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "My List", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "View Interstellar" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Interstellar", exact: true })
    .click();
  await expect(page.getByText("Your next favorites belong here")).toBeVisible();
  await page.getByRole("button", { name: "Movies", exact: true }).click();
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
  await expect(page).not.toHaveURL(/#/);
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
  await page.locator(".hero-content").evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await expect(page.locator(".hero")).toHaveCSS(
    "background-image",
    /\/art\/dune.svg/,
  );
  expect(errors).toEqual([]);
});
