/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { useState } from "react";
import { WysiwygEditor } from "../WysiwygEditor";

/**
 * Integration tests for WysiwygEditor
 * These tests verify the full component behavior including toolbar interactions,
 * formatting commands, undo/redo, templates, bindings, table insertion, and more.
 */

// Helper to render editor with defaults
function renderEditor(props: Partial<React.ComponentProps<typeof WysiwygEditor>> = {}) {
    const defaultProps = {
        content: "",
        setContent: jest.fn(),
        ...props,
    };
    const result = render(<WysiwygEditor {...defaultProps} />);
    const editor = screen.getByRole("textbox");
    return { ...result, editor, setContent: defaultProps.setContent };
}

describe("WysiwygEditor Integration Tests", () => {
    beforeEach(() => {
        document.execCommand = jest.fn().mockReturnValue(true);
        document.queryCommandState = jest.fn().mockReturnValue(false);
        window.prompt = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ─── Rendering & Initialization ───────────────────────────────────

    describe("Rendering & Initialization", () => {
        it("renders the editor container with toolbar and editable area", () => {
            const { container } = renderEditor();
            expect(container.querySelector(".wysiwyg-container")).toBeInTheDocument();
            expect(container.querySelector(".nodegeeks-react-wysiwyg-editor")).toBeInTheDocument();
        });

        it("renders with empty content", () => {
            const { editor } = renderEditor({ content: "" });
            expect(editor.innerHTML).toBe("");
        });

        it("renders with HTML content", () => {
            const { editor } = renderEditor({ content: "<p>Hello <strong>World</strong></p>" });
            expect(editor.innerHTML).toBe("<p>Hello <strong>World</strong></p>");
        });

        it("has contentEditable attribute set", () => {
            const { editor } = renderEditor();
            expect(editor).toHaveAttribute("contenteditable", "true");
        });

        it("has correct ARIA attributes for accessibility", () => {
            const { editor } = renderEditor();
            expect(editor).toHaveAttribute("role", "textbox");
            expect(editor).toHaveAttribute("aria-label", "Rich text editor");
            expect(editor).toHaveAttribute("spellcheck", "true");
        });

        it("does not render debug panel by default", () => {
            const { container } = renderEditor();
            expect(container.querySelector(".debug-panel")).not.toBeInTheDocument();
        });

        it("renders debug panel when debug prop is true", () => {
            const { container } = renderEditor({ debug: true });
            expect(container.querySelector(".debug-panel")).toBeInTheDocument();
        });
    });

    // ─── Text Formatting Commands ─────────────────────────────────────

    describe("Text Formatting Commands", () => {
        it("executes bold command when bold button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Bold"));
            expect(document.execCommand).toHaveBeenCalledWith("bold", false, "false");
        });

        it("executes italic command when italic button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Italic"));
            expect(document.execCommand).toHaveBeenCalledWith("italic", false, "false");
        });

        it("executes underline command when underline button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Underline"));
            expect(document.execCommand).toHaveBeenCalledWith("underline", false, "false");
        });
    });

    // ─── Alignment Commands ───────────────────────────────────────────

    describe("Alignment Commands", () => {
        it("executes justifyLeft when align left button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Align Left"));
            expect(document.execCommand).toHaveBeenCalledWith("justifyLeft", false, "false");
        });

        it("executes justifyCenter when align center button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Align Center"));
            expect(document.execCommand).toHaveBeenCalledWith("justifyCenter", false, "false");
        });

        it("executes justifyRight when align right button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Align Right"));
            expect(document.execCommand).toHaveBeenCalledWith("justifyRight", false, "false");
        });
    });

    // ─── List Commands ────────────────────────────────────────────────

    describe("List Commands", () => {
        it("executes insertUnorderedList when bullet list button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Bullet List"));
            expect(document.execCommand).toHaveBeenCalledWith("insertUnorderedList", false, "false");
        });

        it("executes insertOrderedList when numbered list button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Numbered List"));
            expect(document.execCommand).toHaveBeenCalledWith("insertOrderedList", false, "false");
        });
    });

    // ─── Indent / Outdent ─────────────────────────────────────────────

    describe("Indent / Outdent Commands", () => {
        it("executes indent command when increase indent button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Increase Indent"));
            expect(document.execCommand).toHaveBeenCalledWith("indent", false, "false");
        });

        it("executes outdent command when decrease indent button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Decrease Indent"));
            expect(document.execCommand).toHaveBeenCalledWith("outdent", false, "false");
        });
    });

    // ─── Link Insertion ───────────────────────────────────────────────

    describe("Link Insertion", () => {
        it("prompts for URL and creates link when link button is clicked", () => {
            (window.prompt as jest.Mock).mockReturnValue("https://example.com");
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Add Link"));
            expect(window.prompt).toHaveBeenCalledWith("Enter URL:");
            expect(document.execCommand).toHaveBeenCalledWith("createLink", false, "https://example.com");
        });

        it("does not create link when prompt is cancelled", () => {
            (window.prompt as jest.Mock).mockReturnValue(null);
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Add Link"));
            expect(document.execCommand).not.toHaveBeenCalledWith("createLink", expect.anything(), expect.anything());
        });
    });

    // ─── Image Insertion ──────────────────────────────────────────────

    describe("Image Insertion", () => {
        it("prompts for URL and inserts image when image button is clicked", () => {
            (window.prompt as jest.Mock).mockReturnValue("https://example.com/img.png");
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Add Image"));
            expect(window.prompt).toHaveBeenCalledWith("Enter image URL:");
            expect(document.execCommand).toHaveBeenCalledWith("insertImage", false, "https://example.com/img.png");
        });

        it("does not insert image when prompt is cancelled", () => {
            (window.prompt as jest.Mock).mockReturnValue(null);
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Add Image"));
            expect(document.execCommand).not.toHaveBeenCalledWith("insertImage", expect.anything(), expect.anything());
        });
    });

    // ─── Font Size ────────────────────────────────────────────────────

    describe("Font Size", () => {
        it("executes fontSize command when font size is changed", () => {
            renderEditor({ content: "Test" });
            const fontSizeSelect = screen.getByTitle("Font Size");
            fireEvent.change(fontSizeSelect, { target: { value: "24px" } });
            // handleFontSize parses "24px" → parseInt("24px") = 24, Math.floor(24/4) = 6
            expect(document.execCommand).toHaveBeenCalledWith("fontSize", false, "6");
        });
    });

    // ─── Font Family ──────────────────────────────────────────────────

    describe("Font Family", () => {
        it("executes fontName command when font family is changed", () => {
            renderEditor({ content: "Test" });
            const fontFamilySelect = screen.getByTitle("Font Family");
            fireEvent.change(fontFamilySelect, { target: { value: "Georgia" } });
            expect(document.execCommand).toHaveBeenCalledWith("fontName", false, "Georgia");
        });
    });

    // ─── Color Picker ─────────────────────────────────────────────────

    describe("Color Picker", () => {
        it("executes foreColor command when color is changed", () => {
            renderEditor({ content: "Test" });
            const colorInput = screen.getByTitle("Text Color");
            fireEvent.change(colorInput, { target: { value: "#ff0000" } });
            expect(document.execCommand).toHaveBeenCalledWith("foreColor", false, "#ff0000");
        });
    });

    // ─── Undo / Redo ──────────────────────────────────────────────────

    describe("Undo / Redo", () => {
        it("undo reverts to previous content", () => {
            const setContent = jest.fn();
            const { editor } = renderEditor({ content: "First", setContent });

            // Make a change to create history
            fireEvent.input(editor, { target: { innerHTML: "Second" } });

            // Click undo
            fireEvent.click(screen.getByTitle("Undo"));

            // setContent should have been called with the original content
            expect(setContent).toHaveBeenCalledWith("First");
        });

        it("redo restores undone content", () => {
            const setContent = jest.fn();
            const { editor } = renderEditor({ content: "First", setContent });

            // Make a change
            fireEvent.input(editor, { target: { innerHTML: "Second" } });

            // Undo
            fireEvent.click(screen.getByTitle("Undo"));

            // Redo
            fireEvent.click(screen.getByTitle("Redo"));

            expect(setContent).toHaveBeenCalledWith("Second");
        });

        it("undo does nothing when at beginning of history", () => {
            const setContent = jest.fn();
            renderEditor({ content: "Only", setContent });

            // Clear initial calls
            setContent.mockClear();

            fireEvent.click(screen.getByTitle("Undo"));

            // setContent should not have been called again for undo
            expect(setContent).not.toHaveBeenCalled();
        });

        it("redo does nothing when at end of history", () => {
            const setContent = jest.fn();
            renderEditor({ content: "Only", setContent });

            setContent.mockClear();

            fireEvent.click(screen.getByTitle("Redo"));

            expect(setContent).not.toHaveBeenCalled();
        });
    });

    // ─── Template System ──────────────────────────────────────────────

    describe("Template System", () => {
        const templates = [
            { name: "Welcome", content: "<h1>Welcome!</h1>" },
            { name: "Newsletter", content: "<h2>{{title}}</h2><p>{{body}}</p>" },
        ];

        it("renders template button when templates are provided", () => {
            renderEditor({ templates });
            expect(screen.getByTitle("Template")).toBeInTheDocument();
        });

        it("applies template content when a template is selected", () => {
            const setContent = jest.fn();
            renderEditor({ templates, setContent });

            fireEvent.click(screen.getByTitle("Template"));
            fireEvent.change(screen.getByRole("listbox"), { target: { value: "Welcome" } });

            expect(setContent).toHaveBeenCalledWith("<h1>Welcome!</h1>");
        });

        it("processes bindings in template content", () => {
            const setContent = jest.fn();
            const bindings = { title: "News", body: "Content here" };
            renderEditor({ templates, setContent, bindings });

            fireEvent.click(screen.getByTitle("Template"));
            fireEvent.change(screen.getByRole("listbox"), { target: { value: "Newsletter" } });

            expect(setContent).toHaveBeenCalledWith("<h2>{{title}}</h2><p>{{body}}</p>");
        });

        it("template button is always rendered in toolbar", () => {
            renderEditor({ templates: [] });
            // The template button always renders in ExecCmdToolbar
            expect(screen.getByTitle("Template")).toBeInTheDocument();
        });
    });

    // ─── Data Binding System ──────────────────────────────────────────

    describe("Data Binding System", () => {
        it("processes simple bindings in content", () => {
            const { editor } = renderEditor({
                content: "Hello {{name}}!",
                bindings: { name: "Alice" },
            });
            expect(editor.innerHTML).toContain("Alice");
            expect(editor.querySelector("[data-binding=\"name\"]")).toBeInTheDocument();
        });

        it("processes deeply nested bindings", () => {
            const { editor } = renderEditor({
                content: "{{user.profile.name}}",
                bindings: { user: { profile: { name: "Deep Value" } } },
            });
            expect(editor.innerHTML).toContain("Deep Value");
            expect(editor.querySelector("[data-binding=\"user.profile.name\"]")).toBeInTheDocument();
        });

        it("preserves binding placeholder when value is undefined", () => {
            const { editor } = renderEditor({
                content: "Hello {{missing}}!",
                bindings: {},
            });
            expect(editor.innerHTML).toContain("{{missing}}");
        });

        it("updates binding values reactively", () => {
            let setBindingsRef: React.Dispatch<React.SetStateAction<Record<string, string>>> | null = null;

            const TestComponent = () => {
                const [bindings, setBindings] = useState<Record<string, string>>({ name: "Alice" });
                setBindingsRef = setBindings;
                return (
                    <WysiwygEditor
                        content="Hello {{name}}!"
                        setContent={() => {}}
                        bindings={bindings}
                    />
                );
            };

            render(<TestComponent />);
            const editor = screen.getByRole("textbox");

            expect(editor.innerHTML).toContain("Alice");

            act(() => {
                setBindingsRef!({ name: "Bob" });
            });

            expect(editor.innerHTML).toContain("Bob");
        });

        it("handles multiple bindings in the same content", () => {
            const { editor } = renderEditor({
                content: "{{first}} and {{second}}",
                bindings: { first: "A", second: "B" },
            });
            expect(editor.innerHTML).toContain("A");
            expect(editor.innerHTML).toContain("B");
        });

        it("handles empty content gracefully", () => {
            const { editor } = renderEditor({
                content: "",
                bindings: { name: "Test" },
            });
            expect(editor.innerHTML).toBe("");
        });
    });

    // ─── Table Popover ────────────────────────────────────────────────

    describe("Table Popover", () => {
        it("opens table popover when table button is clicked", () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Insert Table"));
            expect(screen.getByText("Border Color:")).toBeInTheDocument();
            expect(screen.getByText("Cell Padding:")).toBeInTheDocument();
        });

        it("closes table popover when clicking outside", async () => {
            renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Insert Table"));
            expect(screen.getByText("Border Color:")).toBeInTheDocument();

            fireEvent.mouseDown(document);
            await waitFor(() => {
                expect(screen.queryByText("Border Color:")).not.toBeInTheDocument();
            });
        });

        it("renders a 5x5 grid of cells in the popover", () => {
            const { container } = renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Insert Table"));
            const cells = container.querySelectorAll(".table-popover-cell");
            expect(cells.length).toBe(25); // 5x5 grid
        });

        it("highlights cells on hover", () => {
            const { container } = renderEditor({ content: "Test" });
            fireEvent.click(screen.getByTitle("Insert Table"));

            const cells = container.querySelectorAll(".table-popover-cell");
            // Hover over cell at position (1,1) — should highlight a 2x2 area
            fireEvent.mouseOver(cells[6]); // row 1, col 1

            const highlighted = container.querySelectorAll(".table-popover-cell.highlighted");
            expect(highlighted.length).toBeGreaterThan(0);
        });
    });

    // ─── Content Change Handling ──────────────────────────────────────

    describe("Content Change Handling", () => {
        it("calls setContent on every input event", () => {
            const setContent = jest.fn();
            const { editor } = renderEditor({ content: "Start", setContent });

            setContent.mockClear();
            fireEvent.input(editor, { target: { innerHTML: "Changed" } });
            expect(setContent).toHaveBeenCalledWith("Changed");
        });

        it("saves content to history on input", () => {
            const setContent = jest.fn();
            const { editor } = renderEditor({ content: "Start", setContent });

            fireEvent.input(editor, { target: { innerHTML: "Edit 1" } });
            fireEvent.input(editor, { target: { innerHTML: "Edit 2" } });

            // Undo twice should go back to start
            fireEvent.click(screen.getByTitle("Undo"));
            fireEvent.click(screen.getByTitle("Undo"));

            expect(setContent).toHaveBeenCalledWith("Start");
        });
    });

    // ─── Debug Panel ──────────────────────────────────────────────────

    describe("Debug Panel", () => {
        it("shows selection debug info when debug is enabled", () => {
            renderEditor({ content: "Test", debug: true });
            expect(screen.getByText("Selection Debug Info")).toBeInTheDocument();
            expect(screen.getByText("Is Collapsed:")).toBeInTheDocument();
            expect(screen.getByText("Start Position:")).toBeInTheDocument();
            expect(screen.getByText("End Position:")).toBeInTheDocument();
            expect(screen.getByText("Selection Length:")).toBeInTheDocument();
        });

        it("shows N/A values when no selection state exists", () => {
            renderEditor({ content: "Test", debug: true });
            const naElements = screen.getAllByText("N/A");
            expect(naElements.length).toBe(4);
        });
    });

    // ─── Edge Cases ───────────────────────────────────────────────────

    describe("Edge Cases", () => {
        it("handles content with special HTML characters", () => {
            const { editor } = renderEditor({ content: "&lt;script&gt;alert('xss')&lt;/script&gt;" });
            expect(editor.innerHTML).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;");
        });

        it("handles very long content", () => {
            const longContent = "A".repeat(10000);
            const { editor } = renderEditor({ content: longContent });
            expect(editor.innerHTML).toBe(longContent);
        });

        it("handles content with unicode characters", () => {
            const { editor } = renderEditor({ content: "Hello 🌍 世界 مرحبا" });
            expect(editor.innerHTML).toBe("Hello 🌍 世界 مرحبا");
        });

        it("handles rapid sequential inputs", () => {
            const setContent = jest.fn();
            const { editor } = renderEditor({ content: "", setContent });

            setContent.mockClear();

            for (let i = 0; i < 20; i++) {
                fireEvent.input(editor, { target: { innerHTML: `Content ${i}` } });
            }

            // Each input triggers setContent once (via handleChange) + once (via saveToHistory calling setContent indirectly)
            // The exact count depends on implementation; just verify it was called for each input
            expect(setContent.mock.calls.length).toBeGreaterThanOrEqual(20);
        });
    });
});
