import { expect, test } from "@playwright/test";

/**
 * E2E tests for the ModernEditorComponent (DOM-manipulation based) using Playwright.
 * These tests run against the example app's /dom-editor route.
 */

test.describe("ModernEditorComponent (DOM Editor) E2E", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/dom-editor");
        await page.waitForSelector(".modern-editor");
    });

    // ─── Page Load & Structure ────────────────────────────────────────

    test("loads the DOM editor page", async ({ page }) => {
        await expect(page.locator("h1").first()).toContainText("DOM-based WYSIWYG Editor");
    });

    test("editor is contenteditable", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await expect(editor).toHaveAttribute("contenteditable", "true");
    });

    test("editor has correct ARIA attributes", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await expect(editor).toHaveAttribute("role", "textbox");
        await expect(editor).toHaveAttribute("aria-multiline", "true");
    });

    // ─── Text Input ───────────────────────────────────────────────────

    test("can type text into the editor", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("Hello DOM Editor!");

        await expect(editor).toContainText("Hello DOM Editor!");
    });

    test("typed content appears in the output section", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("Output test");

        await expect(page.locator("pre")).toContainText("Output test");
    });

    // ─── Keyboard Shortcuts ───────────────────────────────────────────

    test("Ctrl+B applies bold formatting", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("Normal ");

        await page.keyboard.press("Control+b");
        await page.keyboard.type("Bold");

        const html = await editor.innerHTML();
        expect(html.includes("<strong>") || html.includes("<b>")).toBeTruthy();
    });

    test("Ctrl+I applies italic formatting", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();

        await page.keyboard.press("Control+i");
        await page.keyboard.type("Italic");

        const html = await editor.innerHTML();
        expect(html.includes("<em>") || html.includes("<i>")).toBeTruthy();
    });

    test("Ctrl+U applies underline formatting", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();

        await page.keyboard.press("Control+u");
        await page.keyboard.type("Underlined");

        const html = await editor.innerHTML();
        expect(html.includes("<u>")).toBeTruthy();
    });

    // ─── Toolbar Formatting ───────────────────────────────────────────

    test("bold button applies formatting", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("Test text");

        // Select all text
        await page.keyboard.press("Control+a");

        // Click bold
        await page.click("[title=\"Bold\"]");

        const html = await editor.innerHTML();
        expect(html.includes("<strong>") || html.includes("<b>")).toBeTruthy();
    });

    test("italic button applies formatting", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("Test text");

        await page.keyboard.press("Control+a");
        await page.click("[title=\"Italic\"]");

        const html = await editor.innerHTML();
        expect(html.includes("<em>") || html.includes("<i>")).toBeTruthy();
    });

    test("underline button applies formatting", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("Test text");

        await page.keyboard.press("Control+a");
        await page.click("[title=\"Underline\"]");

        const html = await editor.innerHTML();
        expect(html.includes("<u>")).toBeTruthy();
    });

    // ─── Template System ──────────────────────────────────────────────

    test("can select a template", async ({ page }) => {
        const select = page.locator("select");
        await select.selectOption("Welcome Email");

        const editor = page.locator(".modern-editor");
        await expect(editor).toContainText("Welcome");
    });

    test("template content is rendered in the editor", async ({ page }) => {
        const select = page.locator("select");
        await select.selectOption("Welcome Email");

        const editor = page.locator(".modern-editor");
        const html = await editor.innerHTML();
        expect(html).toContain("Welcome");
    });

    // ─── Binding Inputs ───────────────────────────────────────────────

    test("binding input fields are present", async ({ page }) => {
        await expect(page.locator("input[placeholder=\"First Name\"]")).toBeVisible();
        await expect(page.locator("input[placeholder=\"Email\"]")).toBeVisible();
        await expect(page.locator("input[placeholder=\"Role\"]")).toBeVisible();
        await expect(page.locator("input[placeholder=\"Company Name\"]")).toBeVisible();
    });

    // ─── Table Menu ───────────────────────────────────────────────────

    test("table button opens table menu", async ({ page }) => {
        await page.click("[title=\"Insert Table\"]");
        await expect(page.locator(".table-popup")).toBeVisible();
    });

    test("table menu has row and column inputs", async ({ page }) => {
        await page.click("[title=\"Insert Table\"]");
        await expect(page.locator("text=Rows:")).toBeVisible();
        await expect(page.locator("text=Columns:")).toBeVisible();
    });

    // ─── Debug Panel ──────────────────────────────────────────────────

    test("debug panel is visible", async ({ page }) => {
        await expect(page.locator(".debug-panel")).toBeVisible();
    });

    // ─── Content Persistence ──────────────────────────────────────────

    test("content persists after formatting operations", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("Persistent content");

        // Apply bold
        await page.keyboard.press("Control+a");
        await page.keyboard.press("Control+b");

        await expect(editor).toContainText("Persistent content");
    });

    // ─── Undo / Redo via Keyboard ─────────────────────────────────────

    test("Ctrl+Z undoes last action", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("First");

        // Type more
        await page.keyboard.type(" Second");

        // Undo
        await page.keyboard.press("Control+z");

        const text = await editor.textContent();
        // After undo, "Second" should be removed or content reverted
        expect(text!.length).toBeLessThan("First Second".length);
    });

    test("Ctrl+Shift+Z redoes undone action", async ({ page }) => {
        const editor = page.locator(".modern-editor");
        await editor.click();
        await page.keyboard.type("Hello");

        await page.keyboard.press("Control+z");
        await page.keyboard.press("Control+Shift+z");

        const text = await editor.textContent();
        expect(text).toContain("Hello");
    });
});
