/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { ModernEditorComponent } from "../ModernWysiwygEditor";

/**
 * Integration tests for ModernEditorComponent (DOM-manipulation based editor)
 */

function renderModernEditor(props: Partial<React.ComponentProps<typeof ModernEditorComponent>> = {}) {
    const defaultProps = {
        content: "",
        setContent: jest.fn(),
        ...props,
    };
    const result = render(<ModernEditorComponent {...defaultProps} />);
    return { ...result, setContent: defaultProps.setContent };
}

describe("ModernEditorComponent Integration Tests", () => {
    // ─── Rendering & Initialization ───────────────────────────────────

    describe("Rendering & Initialization", () => {
        it("renders the editor container", () => {
            const { container } = renderModernEditor();
            expect(container.querySelector(".modern-editor-container")).toBeInTheDocument();
        });

        it("creates a contenteditable editor element", () => {
            const { container } = renderModernEditor();
            const editor = container.querySelector("[contenteditable=\"true\"]");
            expect(editor).toBeInTheDocument();
        });

        it("renders with initial content", () => {
            const { container } = renderModernEditor({ content: "<p>Hello World</p>" });
            const editor = container.querySelector("[contenteditable=\"true\"]");
            expect(editor!.innerHTML).toBe("<p>Hello World</p>");
        });

        it("has correct ARIA attributes", () => {
            const { container } = renderModernEditor();
            const editor = container.querySelector("[contenteditable=\"true\"]");
            expect(editor).toHaveAttribute("role", "textbox");
            expect(editor).toHaveAttribute("aria-multiline", "true");
        });

        it("renders toolbar with formatting buttons", () => {
            renderModernEditor();
            expect(screen.getByTitle("Bold")).toBeInTheDocument();
            expect(screen.getByTitle("Italic")).toBeInTheDocument();
            expect(screen.getByTitle("Underline")).toBeInTheDocument();
        });

        it("does not render debug panel by default", () => {
            const { container } = renderModernEditor();
            expect(container.querySelector(".debug-panel")).not.toBeInTheDocument();
        });

        it("renders debug panel when debug is true", () => {
            const { container } = renderModernEditor({ debug: true });
            expect(container.querySelector(".debug-panel")).toBeInTheDocument();
        });
    });

    // ─── Toolbar Buttons ──────────────────────────────────────────────

    describe("Toolbar Buttons", () => {
        it("renders alignment buttons", () => {
            renderModernEditor();
            expect(screen.getByTitle("Align Left")).toBeInTheDocument();
            expect(screen.getByTitle("Align Center")).toBeInTheDocument();
            expect(screen.getByTitle("Align Right")).toBeInTheDocument();
        });

        it("renders list buttons", () => {
            renderModernEditor();
            expect(screen.getByTitle("Bullet List")).toBeInTheDocument();
            expect(screen.getByTitle("Number List")).toBeInTheDocument();
        });

        it("renders table insertion button", () => {
            renderModernEditor();
            expect(screen.getByTitle("Insert Table")).toBeInTheDocument();
        });
    });

    // ─── Template System ──────────────────────────────────────────────

    describe("Template System", () => {
        const templates = [
            { name: "Welcome", content: "<h1>Welcome!</h1>" },
            { name: "Report", content: "<h2>Report</h2><p>Details here</p>" },
        ];

        it("renders template selector when templates are provided", () => {
            renderModernEditor({ templates });
            expect(screen.getByText("Select Template")).toBeInTheDocument();
        });

        it("does not render template selector when no templates provided", () => {
            renderModernEditor({ templates: [] });
            expect(screen.queryByText("Select Template")).not.toBeInTheDocument();
        });

        it("applies template content when selected", () => {
            const setContent = jest.fn();
            const { container } = renderModernEditor({ templates, setContent });

            const select = screen.getByRole("combobox");
            fireEvent.change(select, { target: { value: "Welcome" } });

            const editor = container.querySelector("[contenteditable=\"true\"]");
            expect(editor!.innerHTML).toContain("Welcome!");
            expect(setContent).toHaveBeenCalledWith("<h1>Welcome!</h1>");
        });
    });

    // ─── Content Input ────────────────────────────────────────────────

    describe("Content Input", () => {
        it("calls setContent when content changes via input event", async () => {
            const setContent = jest.fn();
            const { container } = renderModernEditor({ content: "", setContent });

            const editor = container.querySelector("[contenteditable=\"true\"]") as HTMLElement;
            editor.innerHTML = "New content";
            fireEvent.input(editor);

            await waitFor(() => {
                expect(setContent).toHaveBeenCalledWith("New content");
            });
        });
    });

    // ─── Table Menu ───────────────────────────────────────────────────

    describe("Table Menu", () => {
        it("toggles table menu visibility on button click", () => {
            const { container } = renderModernEditor();

            fireEvent.click(screen.getByTitle("Insert Table"));
            expect(container.querySelector(".table-popup")).toBeInTheDocument();

            fireEvent.click(screen.getByTitle("Insert Table"));
            expect(container.querySelector(".table-popup")).not.toBeInTheDocument();
        });

        it("renders row and column inputs in table menu", () => {
            renderModernEditor();
            fireEvent.click(screen.getByTitle("Insert Table"));

            expect(screen.getByText("Rows:")).toBeInTheDocument();
            expect(screen.getByText("Columns:")).toBeInTheDocument();
        });
    });
});
