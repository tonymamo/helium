import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("has expected title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Helium/i);
  });

  test("displays header with logo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Helium").first()).toBeVisible();
  });

  test("shows loading states for projects and languages", async ({ page }) => {
    await page.goto("/");

    // Check for loading skeletons
    await expect(page.getByRole("status").first()).toBeVisible();
    await expect(page.getByText("Loading projects...")).toBeVisible();
    await expect(page.getByText("Loading languages...")).toBeVisible();
  });

  test("allows project selection", async ({ page }) => {
    await page.goto("/");

    // Wait for projects to load
    await page.waitForResponse((response) =>
      response.url().includes("/api/projects"),
    );

    // Click the first project
    const firstProject = page.locator("aside ul li").first();
    await firstProject.click();

    // Verify project is selected
    await expect(firstProject).toHaveClass(/bg-brand-primary/);
  });

  test("allows language selection", async ({ page }) => {
    await page.goto("/");

    // Wait for languages to load
    await page.waitForResponse((response) =>
      response.url().includes("/api/locales"),
    );

    // Click the first language
    const firstLanguage = page.locator("aside ul li").nth(1); // Second list item (first language)
    await firstLanguage.click();

    // Verify language is selected
    await expect(firstLanguage).toHaveClass(/bg-brand-primary/);
  });

  test("shows translation management area when project and language are selected", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for both projects and languages to load
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/api/projects"),
      ),
      page.waitForResponse((response) =>
        response.url().includes("/api/locales"),
      ),
    ]);

    // Select project and language
    await page.locator("aside ul li").first().click();
    await page.locator("aside ul li").nth(1).click();

    // Verify translation management area is visible
    await expect(page.getByText("Translation Management Area")).toBeVisible();
  });

  test("search functionality works", async ({ page }) => {
    await page.goto("/");

    // Wait for initial data to load
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/api/projects"),
      ),
      page.waitForResponse((response) =>
        response.url().includes("/api/locales"),
      ),
    ]);

    // Select project and language
    await page.locator("aside ul li").first().click();
    await page.locator("aside ul li").nth(1).click();

    // Type in search box
    const searchInput = page.getByPlaceholder(
      "Search for a translation key or value",
    );
    await searchInput.fill("test");

    // Verify search query is updated
    await expect(searchInput).toHaveValue("test");
  });

  test("shows placeholder when no project or language is selected", async ({
    page,
  }) => {
    await page.goto("/");

    await page.waitForResponse((response) =>
      response.url().includes("/api/projects"),
    );

    // Verify placeholder message
    await expect(page.getByText("Please select a project")).toBeVisible();

    // select a project now
    await page.locator("aside ul li").first().click();

    // Verify placeholder message is no longer visible
    await expect(page.getByText("Please select a project")).not.toBeVisible();

    // Verify language placeholder is visible
    await expect(page.getByText("Please select a language")).toBeVisible();

    // select a language now
    await page.locator("aside ul li").last().click();

    await expect(page.getByText("Please select a language")).not.toBeVisible();
  });

  test("add key button is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Add Key" })).toBeVisible();
  });
});
