import puppeteer, { Browser, Page } from "puppeteer";

/**
 * E2E tests for the ModernEditorComponent (DOM-manipulation based) using Puppeteer.
 * These tests run against the example app's /dom-editor route.
 */

const BASE_URL = "http://localhost:5173";

describe("ModernEditorComponent E2E (Puppeteer)", () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.goto(`${BASE_URL}/dom-editor`, { waitUntil: "networkidle0" });
        await page.waitForSelector(".modern-editor");
    });

    afterEach(async () => {
        await page.close();
    });

    // ─── Page Load & Structure ────────────────────────────────────────

    it("loads the DOM editor page", async () => {
        const heading = await page.$eval("h1", (el) => el.textContent);
        expect(heading).toContain("DOM-based WYSIWYG Editor");
    });

    it("editor is contenteditable", async () => {
        const isEditable = await page.$eval(
            ".modern-editor",
            (el) => el.getAttribute("contenteditable")
        );
        expect(isEditable).toBe("true");
    });

    it("editor has correct ARIA attributes", async () => {
        const role = await page.$eval(".modern-editor", (el) => el.getAttribute("role"));
        const multiline = await page.$eval(".modern-editor", (el) => el.getAttribute("aria-multiline"));
        expect(role).toBe("textbox");
        expect(multiline).toBe("true");
    });

    // ─── Text Input ───────────────────────────────────────────────────

    it("can type text into the editor", async () => {
        await page.click(".modern-editor");
        await page.keyboard.type("Hello Puppeteer DOM!");

        const text = await page.$eval(".modern-editor", (el) => el.textContent);
        expect(text).toContain("Hello Puppeteer DOM!");
    });

    it("typed content appears in the output", async () => {
        await page.click(".modern-editor");
        await page.keyboard.type("Output test");

        await page.waitForTimeout(200);

        const output = await page.$eval("pre", (el) => el.textContent);
        expect(output).toContain("Output test");
    });

    // ─── Keyboard Shortcuts ───────────────────────────────────────────

    it("Ctrl+B applies bold formatting", async () => {
        await page.click(".modern-editor");
        await page.keyboard.type("Normal ");

        await page.keyboard.down("Control");
        await page.keyboard.press("b");
        await page.keyboard.up("Control");
        await page.keyboard.type("Bold");

        const html = await page.$eval(".modern-editor", (el) => el.innerHTML);
        expect(html.includes("<strong>") || html.includes("<b>")).toBeTruthy();
    });

    it("Ctrl+I applies italic formatting", async () => {
        await page.click(".modern-editor");

        await page.keyboard.down("Control");
        await page.keyboard.press("i");
        await page.keyboard.up("Control");
        await page.keyboard.type("Italic");

        const html = await page.$eval(".modern-editor", (el) => el.innerHTML);
        expect(html.includes("<em>") || html.includes("<i>")).toBeTruthy();
    });

    it("Ctrl+U applies underline formatting", async () => {
        await page.click(".modern-editor");

        await page.keyboard.down("Control");
        await page.keyboard.press("u");
        await page.keyboard.up("Control");
        await page.keyboard.type("Underlined");

        const html = await page.$eval(".modern-editor", (el) => el.innerHTML);
        expect(html.includes("<u>")).toBeTruthy();
    });

    // ─── Toolbar Formatting ───────────────────────────────────────────

    it("bold button applies formatting to selected text", async () => {
        await page.click(".modern-editor");
        await page.keyboard.type("Test text");

        // Select all
        await page.keyboard.down("Control");
        await page.keyboard.press("a");
        await page.keyboard.up("Control");

        await page.click("[title=\"Bold\"]");

        const html = await page.$eval(".modern-editor", (el) => el.innerHTML);
        expect(html.includes("<strong>") || html.includes("<b>")).toBeTruthy();
    });

    it("italic button applies formatting to selected text", async () => {
        await page.click(".modern-editor");
        await page.keyboard.type("Test text");

        await page.keyboard.down("Control");
        await page.keyboard.press("a");
        await page.keyboard.up("Control");

        await page.click("[title=\"Italic\"]");

        const html = await page.$eval(".modern-editor", (el) => el.innerHTML);
        expect(html.includes("<em>") || html.includes("<i>")).toBeTruthy();
    });

    // ─── Template System ──────────────────────────────────────────────

    it("can select a template", async () => {
        await page.select("select", "Welcome Email");

        const text = await page.$eval(".modern-editor", (el) => el.textContent);
        expect(text).toContain("Welcome");
    });

    it("template content is rendered in the editor", async () => {
        await page.select("select", "Welcome Email");

        const html = await page.$eval(".modern-editor", (el) => el.innerHTML);
        expect(html).toContain("Welcome");
    });

    // ─── Binding Inputs ───────────────────────────────────────────────

    it("binding input fields are present", async () => {
        const firstName = await page.$("input[placeholder=\"First Name\"]");
        const email = await page.$("input[placeholder=\"Email\"]");
        const role = await page.$("input[placeholder=\"Role\"]");
        const company = await page.$("input[placeholder=\"Company Name\"]");

        expect(firstName).not.toBeNull();
        expect(email).not.toBeNull();
        expect(role).not.toBeNull();
        expect(company).not.toBeNull();
    });

    // ─── Table Menu ───────────────────────────────────────────────────

    it("table button opens table menu", async () => {
        await page.click("[title=\"Insert Table\"]");

        const popup = await page.$(".table-popup");
        expect(popup).not.toBeNull();
    });

    it("table menu has row and column inputs", async () => {
        await page.click("[title=\"Insert Table\"]");

        const text = await page.$eval(".table-popup", (el) => el.textContent);
        expect(text).toContain("Rows:");
        expect(text).toContain("Columns:");
    });

    it("table menu closes on second click", async () => {
        await page.click("[title=\"Insert Table\"]");
        let popup = await page.$(".table-popup");
        expect(popup).not.toBeNull();

        await page.click("[title=\"Insert Table\"]");
        popup = await page.$(".table-popup");
        expect(popup).toBeNull();
    });

    // ─── Debug Panel ──────────────────────────────────────────────────

    it("debug panel is visible", async () => {
        const debugPanel = await page.$(".debug-panel");
        expect(debugPanel).not.toBeNull();
    });

    // ─── Content Persistence ──────────────────────────────────────────

    it("content persists after formatting operations", async () => {
        await page.click(".modern-editor");
        await page.keyboard.type("Persistent content");

        // Select all and bold
        await page.keyboard.down("Control");
        await page.keyboard.press("a");
        await page.keyboard.up("Control");

        await page.keyboard.down("Control");
        await page.keyboard.press("b");
        await page.keyboard.up("Control");

        const text = await page.$eval(".modern-editor", (el) => el.textContent);
        expect(text).toContain("Persistent content");
    });

    // ─── Undo / Redo via Keyboard ─────────────────────────────────────

    it("Ctrl+Z undoes last action", async () => {
        await page.click(".modern-editor");
        await page.keyboard.type("First");
        await page.keyboard.type(" Second");

        await page.keyboard.down("Control");
        await page.keyboard.press("z");
        await page.keyboard.up("Control");

        const text = await page.$eval(".modern-editor", (el) => el.textContent);
        expect(text!.length).toBeLessThan("First Second".length);
    });

    it("Ctrl+Shift+Z redoes undone action", async () => {
        await page.click(".modern-editor");
        await page.keyboard.type("Hello");

        await page.keyboard.down("Control");
        await page.keyboard.press("z");
        await page.keyboard.up("Control");

        await page.keyboard.down("Control");
        await page.keyboard.down("Shift");
        await page.keyboard.press("z");
        await page.keyboard.up("Shift");
        await page.keyboard.up("Control");

        const text = await page.$eval(".modern-editor", (el) => el.textContent);
        expect(text).toContain("Hello");
    });
});
