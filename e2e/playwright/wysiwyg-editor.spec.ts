import { expect, test } from "@playwright/test";

/**
 * E2E tests for the WysiwygEditor (execCommand-based) using Playwright.
 * These tests run against the example app's /wysiwyg-editor route.
 */

test.describe("WysiwygEditor E2E", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/wysiwyg-editor");
        await page.waitForSelector(".nodegeeks-react-wysiwyg-editor");
    });

    // ─── Page Load & Structure ────────────────────────────────────────

    test("loads the editor page with all elements", async ({ page }) => {
        await expect(page.locator("h1").first()).toContainText("Simple WYSIWYG Editor");
        await expect(page.locator(".wysiwyg-container")).toBeVisible();
        await expect(page.locator(".nodegeeks-react-wysiwyg-editor")).toBeVisible();
    });

    test("editor is contenteditable", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await expect(editor).toHaveAttribute("contenteditable", "true");
    });

    test("editor has correct ARIA attributes", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await expect(editor).toHaveAttribute("role", "textbox");
        await expect(editor).toHaveAttribute("aria-label", "Rich text editor");
    });

    // ─── Text Input ───────────────────────────────────────────────────

    test("can type text into the editor", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("Hello Playwright!");

        await expect(editor).toContainText("Hello Playwright!");
    });

    test("typed content appears in the output section", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("Output test");

        // The example app shows content in a <pre> tag
        await expect(page.locator("pre")).toContainText("Output test");
    });

    // ─── Text Formatting ──────────────────────────────────────────────

    test("can apply bold formatting", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("Hello ");

        // Click bold button, type bold text
        await page.click("[title=\"Bold\"]");
        await page.keyboard.type("World");

        const html = await editor.innerHTML();
        // The editor should contain bold formatting (either <b> or <strong>)
        expect(html.includes("<b>") || html.includes("<strong>")).toBeTruthy();
    });

    test("can apply italic formatting", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();

        await page.click("[title=\"Italic\"]");
        await page.keyboard.type("Italic text");

        const html = await editor.innerHTML();
        expect(html.includes("<i>") || html.includes("<em>")).toBeTruthy();
    });

    test("can apply underline formatting", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();

        await page.click("[title=\"Underline\"]");
        await page.keyboard.type("Underlined");

        const html = await editor.innerHTML();
        expect(html.includes("<u>")).toBeTruthy();
    });

    test("can apply bold with keyboard shortcut Ctrl+B", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("Normal ");

        await page.keyboard.press("Control+b");
        await page.keyboard.type("Bold");

        const html = await editor.innerHTML();
        expect(html.includes("<b>") || html.includes("<strong>")).toBeTruthy();
    });

    test("can apply italic with keyboard shortcut Ctrl+I", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();

        await page.keyboard.press("Control+i");
        await page.keyboard.type("Italic");

        const html = await editor.innerHTML();
        expect(html.includes("<i>") || html.includes("<em>")).toBeTruthy();
    });

    // ─── Template Selection ───────────────────────────────────────────

    test("can select a template from the dropdown", async ({ page }) => {
        // Click the template button to open the selector
        await page.click("[title=\"Template\"]");

        // Select the Welcome Email template
        await page.selectOption("[role=\"listbox\"]", "Welcome Email");

        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await expect(editor).toContainText("Welcome");
    });

    test("template applies bindings from input fields", async ({ page }) => {
        // The example app has binding inputs pre-filled with "John"
        await page.click("[title=\"Template\"]");
        await page.selectOption("[role=\"listbox\"]", "Welcome Email");

        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await expect(editor).toContainText("John");
    });

    // ─── Data Binding Updates ─────────────────────────────────────────

    test("updating binding input updates editor content", async ({ page }) => {
        // First apply a template that uses bindings
        await page.click("[title=\"Template\"]");
        await page.selectOption("[role=\"listbox\"]", "Welcome Email");

        // Update the first name binding
        const firstNameInput = page.locator("input[placeholder=\"First Name\"]");
        await firstNameInput.clear();
        await firstNameInput.fill("Alice");

        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await expect(editor).toContainText("Alice");
    });

    // ─── Table Popover ────────────────────────────────────────────────

    test("can open and close table popover", async ({ page }) => {
        await page.click("[title=\"Insert Table\"]");
        await expect(page.locator(".table-popover")).toBeVisible();

        // Click outside to close
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await expect(page.locator(".table-popover")).not.toBeVisible();
    });

    test("table popover shows grid cells", async ({ page }) => {
        await page.click("[title=\"Insert Table\"]");
        const cells = page.locator(".table-popover-cell");
        await expect(cells).toHaveCount(25);
    });

    test("table popover cells highlight on hover", async ({ page }) => {
        await page.click("[title=\"Insert Table\"]");
        const cells = page.locator(".table-popover-cell");

        // Hover over a cell
        await cells.nth(6).hover(); // row 1, col 1

        const highlighted = page.locator(".table-popover-cell.highlighted");
        const count = await highlighted.count();
        expect(count).toBeGreaterThan(0);
    });

    // ─── Debug Panel ──────────────────────────────────────────────────

    test("debug panel is visible (example app has debug=true)", async ({ page }) => {
        await expect(page.locator(".debug-panel")).toBeVisible();
        await expect(page.locator(".debug-panel")).toContainText("Selection Debug Info");
    });

    test("debug panel updates on cursor movement", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("Hello World");

        // Move cursor
        await page.keyboard.press("Home");

        // Debug panel should show position info
        const debugPanel = page.locator(".debug-panel");
        await expect(debugPanel).toContainText("Start Position:");
    });

    // ─── Undo / Redo ──────────────────────────────────────────────────

    test("undo button reverts content changes", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("First");
        await page.keyboard.type(" Second");

        await page.click("[title=\"Undo\"]");

        // Content should have been reverted
        const text = await editor.textContent();
        expect(text).not.toContain("Second");
    });

    test("redo button restores undone content", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("First");

        // Wait for content to settle
        await page.waitForTimeout(100);

        await page.keyboard.type(" Second");
        await page.waitForTimeout(100);

        await page.click("[title=\"Undo\"]");
        await page.click("[title=\"Redo\"]");

        const text = await editor.textContent();
        expect(text).toContain("Second");
    });

    // ─── Font Controls ────────────────────────────────────────────────

    test("font size selector is present and functional", async ({ page }) => {
        const fontSizeSelect = page.locator("[title=\"Font Size\"]");
        await expect(fontSizeSelect).toBeVisible();
    });

    test("font family selector is present and functional", async ({ page }) => {
        const fontFamilySelect = page.locator("[title=\"Font Family\"]");
        await expect(fontFamilySelect).toBeVisible();
    });

    test("color picker is present", async ({ page }) => {
        const colorPicker = page.locator("[title=\"Text Color\"]");
        await expect(colorPicker).toBeVisible();
    });

    // ─── List Operations ──────────────────────────────────────────────

    test("can create a bullet list", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("Item 1");

        await page.click("[title=\"Bullet List\"]");

        const html = await editor.innerHTML();
        expect(html.includes("<ul>") || html.includes("<li>")).toBeTruthy();
    });

    test("can create an ordered list", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("Item 1");

        await page.click("[title=\"Numbered List\"]");

        const html = await editor.innerHTML();
        expect(html.includes("<ol>") || html.includes("<li>")).toBeTruthy();
    });

    // ─── HTML Output ──────────────────────────────────────────────────

    test("HTML output section renders editor content", async ({ page }) => {
        const editor = page.locator(".nodegeeks-react-wysiwyg-editor");
        await editor.click();
        await page.keyboard.type("Rendered output");

        // The example app has an HTML output section
        const htmlOutput = page.locator("h1:has-text(\"HTML Output\") + div");
        await expect(htmlOutput).toContainText("Rendered output");
    });
});
