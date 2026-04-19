import puppeteer, { Browser, Page } from "puppeteer";

/**
 * E2E tests for the WysiwygEditor (execCommand-based) using Puppeteer.
 * These tests run against the example app's /wysiwyg-editor route.
 */

const BASE_URL = "http://localhost:5173";

describe("WysiwygEditor E2E (Puppeteer)", () => {
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
        await page.goto(`${BASE_URL}/wysiwyg-editor`, { waitUntil: "networkidle0" });
        await page.waitForSelector(".nodegeeks-react-wysiwyg-editor");
    });

    afterEach(async () => {
        await page.close();
    });

    // ─── Page Load & Structure ────────────────────────────────────────

    it("loads the editor page", async () => {
        const heading = await page.$eval("h1", (el) => el.textContent);
        expect(heading).toContain("Simple WYSIWYG Editor");
    });

    it("renders the editor container", async () => {
        const container = await page.$(".wysiwyg-container");
        expect(container).not.toBeNull();
    });

    it("editor is contenteditable", async () => {
        const isEditable = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.getAttribute("contenteditable")
        );
        expect(isEditable).toBe("true");
    });

    it("editor has correct ARIA role", async () => {
        const role = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.getAttribute("role")
        );
        expect(role).toBe("textbox");
    });

    // ─── Text Input ───────────────────────────────────────────────────

    it("can type text into the editor", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("Hello Puppeteer!");

        const text = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.textContent
        );
        expect(text).toContain("Hello Puppeteer!");
    });

    it("typed content appears in the string output", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("Output test");

        const output = await page.$eval("pre", (el) => el.textContent);
        expect(output).toContain("Output test");
    });

    // ─── Text Formatting ──────────────────────────────────────────────

    it("can apply bold formatting via toolbar", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("Hello ");

        await page.click("[title=\"Bold\"]");
        await page.keyboard.type("World");

        const html = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.innerHTML
        );
        expect(html.includes("<b>") || html.includes("<strong>")).toBeTruthy();
    });

    it("can apply italic formatting via toolbar", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");

        await page.click("[title=\"Italic\"]");
        await page.keyboard.type("Italic text");

        const html = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.innerHTML
        );
        expect(html.includes("<i>") || html.includes("<em>")).toBeTruthy();
    });

    it("can apply underline formatting via toolbar", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");

        await page.click("[title=\"Underline\"]");
        await page.keyboard.type("Underlined");

        const html = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.innerHTML
        );
        expect(html.includes("<u>")).toBeTruthy();
    });

    it("can apply bold with Ctrl+B", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("Normal ");

        await page.keyboard.down("Control");
        await page.keyboard.press("b");
        await page.keyboard.up("Control");
        await page.keyboard.type("Bold");

        const html = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.innerHTML
        );
        expect(html.includes("<b>") || html.includes("<strong>")).toBeTruthy();
    });

    // ─── Template Selection ───────────────────────────────────────────

    it("can select a template", async () => {
        await page.click("[title=\"Template\"]");

        await page.select("[role=\"listbox\"]", "Welcome Email");

        const text = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.textContent
        );
        expect(text).toContain("Welcome");
    });

    it("template applies bindings", async () => {
        await page.click("[title=\"Template\"]");
        await page.select("[role=\"listbox\"]", "Welcome Email");

        const text = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.textContent
        );
        expect(text).toContain("John");
    });

    // ─── Data Binding Updates ─────────────────────────────────────────

    it("updating binding input updates editor content", async () => {
        // Apply template first
        await page.click("[title=\"Template\"]");
        await page.select("[role=\"listbox\"]", "Welcome Email");

        // Clear and update the first name input
        const firstNameInput = await page.$("input[placeholder=\"First Name\"]");
        await firstNameInput!.click({ clickCount: 3 }); // Select all
        await page.keyboard.type("Alice");

        const text = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.textContent
        );
        expect(text).toContain("Alice");
    });

    // ─── Table Popover ────────────────────────────────────────────────

    it("can open table popover", async () => {
        await page.click("[title=\"Insert Table\"]");

        const popover = await page.$(".table-popover");
        expect(popover).not.toBeNull();
    });

    it("table popover has 25 cells (5x5 grid)", async () => {
        await page.click("[title=\"Insert Table\"]");

        const cellCount = await page.$$eval(
            ".table-popover-cell",
            (cells) => cells.length
        );
        expect(cellCount).toBe(25);
    });

    it("closes table popover when clicking outside", async () => {
        await page.click("[title=\"Insert Table\"]");

        let popover = await page.$(".table-popover");
        expect(popover).not.toBeNull();

        // Click outside
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.waitForTimeout(200);

        popover = await page.$(".table-popover");
        expect(popover).toBeNull();
    });

    // ─── Debug Panel ──────────────────────────────────────────────────

    it("debug panel is visible", async () => {
        const debugPanel = await page.$(".debug-panel");
        expect(debugPanel).not.toBeNull();
    });

    it("debug panel shows selection info labels", async () => {
        const text = await page.$eval(".debug-panel", (el) => el.textContent);
        expect(text).toContain("Selection Debug Info");
        expect(text).toContain("Is Collapsed:");
        expect(text).toContain("Start Position:");
    });

    // ─── Undo / Redo ──────────────────────────────────────────────────

    it("undo button reverts content", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("First");
        await page.keyboard.type(" Second");

        await page.click("[title=\"Undo\"]");

        const text = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.textContent
        );
        expect(text).not.toContain("Second");
    });

    it("redo button restores undone content", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("First");

        await page.waitForTimeout(100);
        await page.keyboard.type(" Second");
        await page.waitForTimeout(100);

        await page.click("[title=\"Undo\"]");
        await page.click("[title=\"Redo\"]");

        const text = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.textContent
        );
        expect(text).toContain("Second");
    });

    // ─── Font Controls ────────────────────────────────────────────────

    it("font size selector is present", async () => {
        const fontSizeSelect = await page.$("[title=\"Font Size\"]");
        expect(fontSizeSelect).not.toBeNull();
    });

    it("font family selector is present", async () => {
        const fontFamilySelect = await page.$("[title=\"Font Family\"]");
        expect(fontFamilySelect).not.toBeNull();
    });

    it("color picker is present", async () => {
        const colorPicker = await page.$("[title=\"Text Color\"]");
        expect(colorPicker).not.toBeNull();
    });

    // ─── List Operations ──────────────────────────────────────────────

    it("can create a bullet list", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("Item 1");

        await page.click("[title=\"Bullet List\"]");

        const html = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.innerHTML
        );
        expect(html.includes("<ul>") || html.includes("<li>")).toBeTruthy();
    });

    it("can create an ordered list", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("Item 1");

        await page.click("[title=\"Numbered List\"]");

        const html = await page.$eval(
            ".nodegeeks-react-wysiwyg-editor",
            (el) => el.innerHTML
        );
        expect(html.includes("<ol>") || html.includes("<li>")).toBeTruthy();
    });

    // ─── HTML Output ──────────────────────────────────────────────────

    it("HTML output section renders editor content", async () => {
        await page.click(".nodegeeks-react-wysiwyg-editor");
        await page.keyboard.type("Rendered output");

        // Wait for output to update
        await page.waitForTimeout(200);

        const preContent = await page.$eval("pre", (el) => el.textContent);
        expect(preContent).toContain("Rendered output");
    });
});
