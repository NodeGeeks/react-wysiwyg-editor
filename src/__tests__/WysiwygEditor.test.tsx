/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React, { useState } from "react";
import { WysiwygEditor } from "../WysiwygEditor";

describe("WysiwygEditor", () => {
    beforeEach(() => {
        document.execCommand = jest.fn();
    });

    it("renders with initial content", () => {
        const content = "Initial content";
        render(
            <WysiwygEditor
                content={content}
                setContent={() => {console.log("")}}
            />
        );
        const editor = screen.getByRole("textbox");
        expect(editor.innerHTML).toBe(content);
    });

    it("calls setContent when content is modified", () => {
        const setContent = jest.fn();
        render(
            <WysiwygEditor
                content="Initial content"
                setContent={setContent}
            />
        );
    
        const editor = screen.getByRole("textbox");
        fireEvent.input(editor, { target: { innerHTML: "New content" } });
    
        expect(setContent).toHaveBeenCalledWith("New content");
    });

    it("processes bindings correctly", () => {
        const content = "Hello {{name}}!";
        const bindings = { name: "World" };
    
        render(
            <WysiwygEditor
                content={content}
                setContent={() => {console.log("")}}
                bindings={bindings}
            />
        );
    
        const editor = screen.getByRole("textbox");
        expect(editor.innerHTML).toBe("Hello <span class=\"template-binding\" data-binding=\"name\">World</span>!");
    });

    it("processes nested bindings correctly", () => {
        const content = "Hello {{contact.name}}!";
        const bindings = { contact: { name: "World" } };
    
        render(
            <WysiwygEditor
                content={content}
                setContent={() => {console.log("")}}
                bindings={bindings}
            />
        );
    
        const editor = screen.getByRole("textbox");
        expect(editor.innerHTML).toBe("Hello <span class=\"template-binding\" data-binding=\"contact.name\">World</span>!");
    });

    it("updates binding correctly", () => {
    // Create a ref to hold the setBindings function
        let setBindingsRef: React.Dispatch<React.SetStateAction<{ name: string }>> | null = null;
  
        const TestComponent = () => {
            const [bindings, setBindings] = useState({ name: "World" });
            // Store the setBindings function in our ref so we can access it outside
            setBindingsRef = setBindings;
      
            return (
                <WysiwygEditor
                    content="Hello {{name}}!"
                    setContent={() => { console.log(""); }}
                    bindings={bindings}
                />
            );
        };
  
        render(<TestComponent />);
    
        const editor = screen.getByRole("textbox");
        expect(editor.innerHTML).toBe("Hello <span class=\"template-binding\" data-binding=\"name\">World</span>!");
    
        // Update bindings through state
        act(() => {
            setBindingsRef!({ name: "NodeGeeks" });
        });
    
        expect(editor.innerHTML).toBe("Hello <span class=\"template-binding\" data-binding=\"name\">NodeGeeks</span>!");
    });

    it("handles templates correctly", () => {
        const setContent = jest.fn();
        const templates = [
            { name: "Template 1", content: "<p>Template content</p>" },
        ];

        render(
            <WysiwygEditor content="" setContent={setContent} templates={templates} />
        );

        // Open the template selector
        fireEvent.click(screen.getByTitle("Template"));

        // Select the template
        fireEvent.change(screen.getByRole("listbox"), { target: { value: "Template 1" } });

        // Check if setContent was called with the correct content
        expect(setContent).toHaveBeenCalledWith("<p>Template content</p>");
    });

    it("should close TablePopover when clicking outside", async () => {
        render(
            <WysiwygEditor
                content="Initial content"
                setContent={() => {console.log("")}}
            />
        );

        // Open table popover
        fireEvent.click(screen.getByTitle("Insert Table"));
        expect(screen.getByText("Border Color:")).toBeInTheDocument();

        // Click outside the popover
        fireEvent.mouseDown(document);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for state updates

        // Verify popover is closed
        expect(screen.queryByText("Border Color:")).not.toBeInTheDocument();
    });

});