import React from "react";
import { DebugPanel } from "./components/DebugPanel";
import { Toolbar } from "./components/Toolbar";

interface EditorState {
    selection: {
        start: number;
        end: number;
    };
    content: string;
    history: string[];
    historyIndex: number;
}

interface Template {
    name: string;
    content: string;
}

interface EditorConfig {
    bindings?: Record<string, any>;
    templates?: Template[];
    setContent?: (content: string) => void;
    debug?: boolean;
}

/**
 * A rich text editor class that provides advanced editing capabilities with support for formatting,
 * templates, and content history management.
 */
class RichEditor {
    /** The container element that hosts the editor */
    private container: HTMLElement;
    /** The main contenteditable element where editing occurs */
    public editorElement: HTMLElement;
    /** Internal state tracking content, history, and selection */
    private state: EditorState;
    /** Callback function to handle content changes */
    private setContent?: (content: string) => void;

    constructor(container: HTMLElement, initialContent = "", config?: EditorConfig) {
        this.container = container;
        this.setContent = config?.setContent;
        this.editorElement = document.createElement("div");
        this.editorElement.className = "modern-editor";
        this.editorElement.setAttribute("contenteditable", "true");
        this.editorElement.setAttribute("role", "textbox");
        this.editorElement.setAttribute("aria-multiline", "true");

        this.state = {
            selection: { start: 0, end: 0 },
            content: initialContent,
            history: [initialContent],
            historyIndex: 0
        };

        this.setupEditor();
    }

    /**
     * Initializes the editor by setting up the contenteditable element and event listeners
     * @private
     */
    private setupEditor(): void {
        this.container.appendChild(this.editorElement);
        this.editorElement.innerHTML = this.state.content;
        this.editorElement.addEventListener("paste", this.handlePaste.bind(this));
        this.editorElement.addEventListener("input", () => {
            this.updateContent(this.editorElement.innerHTML);
        });
        this.editorElement.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    /**
     * Handles keyboard events for the editor, including keyboard shortcuts
     * @private
     * @param event - The keyboard event to handle
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case "b":
                    event.preventDefault();
                    this.toggleFormat("strong");
                    break;
                case "i":
                    event.preventDefault();
                    this.toggleFormat("em");
                    break;
                case "u":
                    event.preventDefault();
                    this.toggleFormat("u");
                    break;
                case "z":
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                break;
            }
        }
    }

    /**
     * Toggles the specified HTML formatting tag for the current selection.
     * If the selection already has the formatting, it will be removed.
     * If the selection doesn't have the formatting, it will be applied.
     * 
     * @param {string} tagName - The HTML tag name to toggle (e.g., 'b', 'i', 'u')
     * @throws {Error} When the selection cannot be properly formatted
     * @returns {void}
     * 
     * @example
     * // To toggle bold formatting
     * toggleFormat('b');
     * 
     * // To toggle italic formatting
     * toggleFormat('i');
     */
    public toggleFormat(tagName: string): void {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        if (!range) return;

        // Check if the selection is within or contains the same formatting
        const currentNode = range.commonAncestorContainer;
        let existingFormat = this.findParentWithTag(currentNode, tagName);

        // If no direct parent found, check if selection contains the tag
        if (!existingFormat && !range.collapsed) {
            // Check if selection contains or is contained by the tag
            let node = currentNode;
            while (node && node.nodeType === Node.TEXT_NODE) {
                node = node.parentNode as Node;
            }
            if (node && node.nodeName.toLowerCase() === tagName.toLowerCase()) {
                existingFormat = node as HTMLElement;
            }
        }

        if (existingFormat) {
            // Remove formatting
            const parent = existingFormat.parentNode;
            if (!parent) return;

            // If the selection is inside the formatted element
            if (range.commonAncestorContainer === existingFormat || 
                existingFormat.contains(range.commonAncestorContainer)) {
                const fragment = document.createDocumentFragment();
                while (existingFormat.firstChild) {
                    fragment.appendChild(existingFormat.firstChild);
                }
                parent.replaceChild(fragment, existingFormat);
            }
        } else {
            // Apply formatting
            const element = document.createElement(tagName);
            
            try {
                // Handle collapsed selection (cursor position)
                if (range.collapsed) {
                    element.textContent = "\u200B"; // Zero-width space
                    range.insertNode(element);
                    
                    // Place cursor inside the new element
                    const newRange = document.createRange();
                    newRange.setStart(element, 0);
                    newRange.setEnd(element, 1);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    // Check if selection already contains the same tag
                    const containsSameTag = Array.from(range.cloneContents().childNodes)
                        .some(node => node.nodeName.toLowerCase() === tagName.toLowerCase());
                    
                    if (!containsSameTag) {
                        range.surroundContents(element);
                    }
                }
            } catch (e) {
                // Handle complex selections
                const fragment = range.extractContents();
                // Check for existing formatting in the fragment
                if (!this.hasTagInFragment(fragment, tagName)) {
                    element.appendChild(fragment);
                    range.insertNode(element);
                } else {
                    range.insertNode(fragment);
                }
            }
        }

        this.normalizeContent();
        this.updateContent(this.editorElement.innerHTML);
    }

    /**
     * Checks if a DocumentFragment contains a specific HTML tag.
     * This is used to prevent duplicate wrapping of elements with the same formatting.
     * 
     * @param {DocumentFragment} fragment - The document fragment to check
     * @param {string} tagName - The HTML tag name to search for
     * @returns {boolean} True if the fragment contains the specified tag, false otherwise
     * 
     * @private
     * @example
     * const fragment = document.createDocumentFragment();
     * // ... add content to fragment
     * const hasBoldTag = this.hasTagInFragment(fragment, 'b');
     */
    private hasTagInFragment(fragment: DocumentFragment, tagName: string): boolean {
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment.cloneNode(true));
        return tempDiv.getElementsByTagName(tagName).length > 0;
    }

    
    // Helper method to find parent element with specific tag
    /**
     * Finds the nearest parent element with the specified tag name
     * @private
     * @param node - The starting node to search from
     * @param tagName - The HTML tag name to search for
     * @returns The found element or null if not found
     */
    private findParentWithTag(node: Node, tagName: string): HTMLElement | null {
        const tagNameLower = tagName.toLowerCase();
        let current = node;
        while (current && current !== this.editorElement) {
            if (current.nodeType === Node.ELEMENT_NODE && 
                (current as HTMLElement).tagName.toLowerCase() === tagNameLower) {
                return current as HTMLElement;
            }
            current = current.parentNode as Node;
        }
        return null;
    }

    // Improved paste handler
    /**
     * Handles paste events, sanitizing and formatting pasted content
     * @private
     * @param event - The clipboard event containing pasted content
     */
    private handlePaste(event: ClipboardEvent): void {
        event.preventDefault();

        const clipboardData = event.clipboardData;
        if (!clipboardData) return;

        // Store the current selection
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);

        // Try to get HTML content first
        let content = clipboardData.getData("text/html");

        // Fall back to plain text if no HTML
        if (!content) {
            content = clipboardData.getData("text/plain");
            if (content) {
                // Convert plain text to HTML preserving line breaks
                content = content.split(/\r\n|\r|\n/).map(line => 
                    line.trim() ? `<p>${line}</p>` : "<p><br></p>"
                ).join("");
            }
        }

        if (content) {
            // Create temporary container and insert sanitized content
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = this.sanitizeHtml(content);

            // Create document fragment for efficient insertion
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }

            // Delete current selection and insert new content
            range.deleteContents();
            range.insertNode(fragment);

            // Move selection after inserted content
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

            this.normalizeContent();
            this.updateContent(this.editorElement.innerHTML);
        }
    }

    /**
     * Normalizes the editor content by merging adjacent identical elements
     * and ensuring proper block structure
     */
    public normalizeContent(): void {
        if (!this.editorElement) return;

        // Merge adjacent identical inline elements
        const mergeableElements = ["strong", "em", "u", "strike", "s", "code", "mark"];

        mergeableElements.forEach(tagName => {
            const elements = this.editorElement.getElementsByTagName(tagName);
            for (let i = elements.length - 1; i > 0; i--) {
                const current = elements[i];
                const previous = elements[i - 1];

                if (current.previousSibling === previous) {
                    if (current.getAttribute("style") === previous.getAttribute("style")) {
                        while (current.firstChild) {
                            previous.appendChild(current.firstChild);
                        }
                        current.remove();
                    }
                }
            }
        });

        // Ensure proper block structure
        if (!this.editorElement.querySelector("p, div, h1, h2, h3, h4, h5, h6")) {
            const content = this.editorElement.innerHTML;
            this.editorElement.innerHTML = `<p>${content}</p>`;
        }
    }

    /**
     * Updates the editor content and manages the history stack
     * @private
     * @param newContent - The new content to set in the editor
     */
    private updateContent(newContent: string): void {
        if (newContent !== this.state.content) {
            // Remove any redo history when new changes occur
            this.state.history = [
                ...this.state.history.slice(0, this.state.historyIndex + 1),
                newContent
            ];
            this.state.historyIndex = this.state.history.length - 1;
            this.state.content = newContent;
            this.setContent?.(newContent);
        }
    }

    public undo(): void {
        if (this.state.historyIndex > 0) {
            this.state.historyIndex--;
            this.editorElement.innerHTML = this.state.history[this.state.historyIndex];
            this.state.content = this.state.history[this.state.historyIndex];
            this.setContent?.(this.state.content);
        }
    }

    public redo(): void {
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.historyIndex++;
            this.editorElement.innerHTML = this.state.history[this.state.historyIndex];
            this.state.content = this.state.history[this.state.historyIndex];
            this.setContent?.(this.state.content);
        }
    }

    public clearHistory(): void {
        this.state.history = [this.state.content];
        this.state.historyIndex = 0;
    }

    private readonly allowedTags = [
        // Block Elements
        "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
        "blockquote", "pre", "ul", "ol", "li",
        // Inline Elements
        "strong", "b", "em", "i", "u", "strike", "s",
        "sub", "sup", "code", "mark", "span",
        // Special Elements
        "img", "br", "hr", "a", "table", "thead", "tbody",
        "tr", "td", "th"
    ];

    private readonly allowedAttributes: { [key: string]: string[] } = {
        "a": ["href", "title", "target"],
        "img": ["src", "alt", "title", "width", "height"],
        "*": ["style", "class"] // Allowed on all elements
    };

    /**
     * Sanitizes HTML content by removing disallowed tags and attributes
     * @private
     * @param html - The HTML content to sanitize
     * @returns The sanitized HTML string
     */
    private sanitizeHtml(html: string): string {
        if (typeof window === "undefined") return html;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        const sanitize = (node: Node): Node | null => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const tagName = element.tagName.toLowerCase();
                
                // Check if tag is allowed
                if (!this.allowedTags.includes(tagName)) {
                    // Return text content only for disallowed tags
                    return document.createTextNode(element.textContent || "");
                }
                
                // Create new element of the same type
                const newElement = document.createElement(tagName);
                
                // Copy allowed attributes
                const allowedForTag = [
                    ...(this.allowedAttributes[tagName] || []),
                    ...(this.allowedAttributes["*"] || [])
                ];
                
                Array.from(element.attributes).forEach(attr => {
                    if (allowedForTag.includes(attr.name)) {
                        newElement.setAttribute(attr.name, attr.value);
                    }
                });
                
                // Recursively sanitize children
                Array.from(element.childNodes).forEach(child => {
                    const sanitizedChild = sanitize(child);
                    if (sanitizedChild) {
                        newElement.appendChild(sanitizedChild);
                    }
                });
                
                return newElement;
            } else if (node.nodeType === Node.TEXT_NODE) {
                return node.cloneNode(true);
            }
            
            return null;
        };
        
        const sanitizedFragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            const sanitizedNode = sanitize(node);
            if (sanitizedNode) {
                sanitizedFragment.appendChild(sanitizedNode);
            }
        });
        
        const resultContainer = document.createElement("div");
        resultContainer.appendChild(sanitizedFragment);
        return resultContainer.innerHTML;
    }
}

// React component wrapper
interface EditorProps {
    content: string;
    setContent: (content: string) => void;
    bindings?: Record<string, any>;
    templates?: Template[];
    debug?: boolean;
}

export const ModernEditorComponent: React.FC<EditorProps> = ({
    content,
    setContent,
    bindings,
    templates,
    debug
}) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const editorInstanceRef = React.useRef<RichEditor | null>(null);

    React.useEffect(() => {
        if (editorRef.current && !editorInstanceRef.current) {
            editorInstanceRef.current = new RichEditor(editorRef.current, content, {
                bindings,
                templates,
                setContent
            });
        }
    }, []);

    function onTemplate (template: Template) {
        if (editorInstanceRef.current?.editorElement) {
            editorInstanceRef.current.editorElement.innerHTML = template.content;
            editorInstanceRef.current.normalizeContent();
            setContent(template.content);
        }
    }
    return (
        <div className="modern-editor-container">
            <Toolbar
                onFormat={(format) => editorInstanceRef.current?.toggleFormat(format)}
                templates={templates || []}
                onTable={function (): void {
                    throw new Error("Function not implemented.");
                } } onTemplate={onTemplate}            />
            <div ref={editorRef} />
            {debug && <DebugPanel selectionState={null} />}
        </div>
    );
};

export { type Template };

