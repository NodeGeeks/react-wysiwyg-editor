import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { DebugPanel } from "../components/DebugPanel";
import { TablePopover } from "../components/TablePopover";
import { TemplateSelector } from "../components/TemplateSelector";

/**
 * Integration tests for individual components
 */

describe("DebugPanel", () => {
    it("renders with null selection state", () => {
        render(<DebugPanel selectionState={null} />);
        expect(screen.getByText("Selection Debug Info")).toBeInTheDocument();
        expect(screen.getAllByText("N/A")).toHaveLength(4);
    });

    it("renders with valid selection state", () => {
        const selectionState = {
            isCollapsed: true,
            start: 5,
            end: 10,
            length: 5,
        };
        render(<DebugPanel selectionState={selectionState} />);
        expect(screen.getByText("true")).toBeInTheDocument();
        expect(screen.getAllByText("5")).toHaveLength(2); // start=5 and length=5
        expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("displays all debug fields", () => {
        render(<DebugPanel selectionState={null} />);
        expect(screen.getByText("Is Collapsed:")).toBeInTheDocument();
        expect(screen.getByText("Start Position:")).toBeInTheDocument();
        expect(screen.getByText("End Position:")).toBeInTheDocument();
        expect(screen.getByText("Selection Length:")).toBeInTheDocument();
    });
});

describe("TablePopover", () => {
    it("renders a 5x5 grid", () => {
        const { container } = render(<TablePopover onSelect={jest.fn()} />);
        const cells = container.querySelectorAll(".table-popover-cell");
        expect(cells).toHaveLength(25);
    });

    it("renders border color and cell padding inputs", () => {
        render(<TablePopover onSelect={jest.fn()} />);
        expect(screen.getByText("Border Color:")).toBeInTheDocument();
        expect(screen.getByText("Cell Padding:")).toBeInTheDocument();
    });

    it("highlights cells on mouse over", () => {
        const { container } = render(<TablePopover onSelect={jest.fn()} />);
        const cells = container.querySelectorAll(".table-popover-cell");

        // Hover over cell at row 2, col 2 (index 12 = row2*5 + col2)
        fireEvent.mouseOver(cells[12]);

        const highlighted = container.querySelectorAll(".table-popover-cell.highlighted");
        // Should highlight a 3x3 area (rows 0-2, cols 0-2) = 9 cells
        expect(highlighted.length).toBe(9);
    });

    it("calls onSelect with correct dimensions on cell click", () => {
        const onSelect = jest.fn();
        const { container } = render(<TablePopover onSelect={onSelect} />);
        const cells = container.querySelectorAll(".table-popover-cell");

        // Hover to set dimensions, then click
        fireEvent.mouseOver(cells[6]); // row 1, col 1
        fireEvent.click(cells[6]);

        expect(onSelect).toHaveBeenCalledWith(2, 2, expect.objectContaining({
            borderColor: "#000000",
            cellPadding: "5px",
        }));
    });

    it("allows changing border color", () => {
        const onSelect = jest.fn();
        const { container } = render(<TablePopover onSelect={onSelect} />);

        const colorInput = container.querySelector("input[type=\"color\"]") as HTMLInputElement;
        fireEvent.change(colorInput, { target: { value: "#ff0000" } });

        const cells = container.querySelectorAll(".table-popover-cell");
        fireEvent.mouseOver(cells[0]);
        fireEvent.click(cells[0]);

        expect(onSelect).toHaveBeenCalledWith(1, 1, expect.objectContaining({
            borderColor: "#ff0000",
        }));
    });

    it("allows changing cell padding", () => {
        const onSelect = jest.fn();
        const { container } = render(<TablePopover onSelect={onSelect} />);

        const textInput = container.querySelector("input[type=\"text\"]") as HTMLInputElement;
        fireEvent.change(textInput, { target: { value: "10px" } });

        const cells = container.querySelectorAll(".table-popover-cell");
        fireEvent.mouseOver(cells[0]);
        fireEvent.click(cells[0]);

        expect(onSelect).toHaveBeenCalledWith(1, 1, expect.objectContaining({
            cellPadding: "10px",
        }));
    });

    it("forwards ref correctly", () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<TablePopover onSelect={jest.fn()} ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
        expect(ref.current!.classList.contains("table-popover")).toBe(true);
    });
});

describe("TemplateSelector", () => {
    const templates = [
        { name: "Template A", content: "<p>Content A</p>" },
        { name: "Template B", content: "<p>Content B</p>" },
    ];

    it("renders all templates", () => {
        render(<TemplateSelector templates={templates} onSelectTemplate={jest.fn()} />);
        expect(screen.getByText("Template A")).toBeInTheDocument();
        expect(screen.getByText("Template B")).toBeInTheDocument();
    });

    it("calls onSelectTemplate when a template is clicked", () => {
        const onSelect = jest.fn();
        render(<TemplateSelector templates={templates} onSelectTemplate={onSelect} />);

        fireEvent.click(screen.getByText("Template A"));
        expect(onSelect).toHaveBeenCalledWith(templates[0]);
    });

    it("renders empty when no templates provided", () => {
        const { container } = render(<TemplateSelector templates={[]} onSelectTemplate={jest.fn()} />);
        const selector = container.querySelector(".template-selector");
        expect(selector).toBeInTheDocument();
        expect(selector!.children).toHaveLength(0);
    });

    it("renders template items with correct class", () => {
        const { container } = render(<TemplateSelector templates={templates} onSelectTemplate={jest.fn()} />);
        const items = container.querySelectorAll(".template-item");
        expect(items).toHaveLength(2);
    });
});
