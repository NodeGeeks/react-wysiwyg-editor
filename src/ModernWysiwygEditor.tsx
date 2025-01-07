import React, { useState } from 'react';
import { DebugPanel } from './components/DebugPanel';
import { Toolbar } from './components/Toolbar';

// Core interfaces for editor configuration and state management
interface ElementConfig {
    blockElement: boolean;      // Whether element is block-level
    replacedElement: boolean;   // Whether element is replaced (like img)
    inlineElement: boolean;     // Whether element can be used inline
    visualLength: number;       // Visual length contribution to offset
    isVoid: boolean;           // Whether element is self-closing
}

interface EditorState {
    selection: {
        start: number;           // Start offset of selection
        end: number;            // End offset of selection
    };
    content: string;          // Current editor content
    history: string[];        // Undo/redo history
    historyIndex: number;     // Current position in history
}

interface Template {
    name: string;
    content: string;
}

interface EditorConfig {
    bindings?: Record<string, any>;
    templates?: Template[];
    onChange?: (content: string) => void;
    debug?: boolean;
}

class RichEditor {
    private container: HTMLElement;
    public editorElement: HTMLElement;
    private state: EditorState;
    private isUpdating = false;
    private bindings: Record<string, any> = {};
    private onChange?: (content: string) => void;

    // Comprehensive configuration for HTML elements supported by the editor
    private readonly elementConfigs: Record<string, ElementConfig> = {
        // Block Elements
        'p': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'div': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'h1': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'h2': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'h3': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'h4': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'h5': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'h6': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'blockquote': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'pre': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },

        // List Elements
        'ul': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'ol': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'li': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },

        // Table Elements
        'table': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'thead': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'tbody': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'tr': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'td': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },
        'th': { blockElement: true, replacedElement: false, inlineElement: false, visualLength: 1, isVoid: false },

        // Inline Elements
        'strong': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'b': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'em': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'i': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'u': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'strike': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        's': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'sub': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'sup': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'code': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'mark': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
        'span': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },

        // Special Elements
        'img': { blockElement: false, replacedElement: true, inlineElement: true, visualLength: 1, isVoid: true },
        'br': { blockElement: false, replacedElement: true, inlineElement: true, visualLength: 1, isVoid: true },
        'hr': { blockElement: true, replacedElement: true, inlineElement: false, visualLength: 1, isVoid: true },
        'a': { blockElement: false, replacedElement: false, inlineElement: true, visualLength: 0, isVoid: false },
    };

    constructor(container: HTMLElement, initialContent = '', config?: EditorConfig) {
        this.container = container;
        this.bindings = config?.bindings || {};
        this.onChange = config?.onChange;
        this.editorElement = document.createElement('div');
        this.editorElement.className = 'modern-editor';
        this.editorElement.setAttribute('contenteditable', 'true');
        this.editorElement.setAttribute('role', 'textbox');
        this.editorElement.setAttribute('aria-multiline', 'true');

        // Initialize editor state
        this.state = {
            selection: { start: 0, end: 0 },
            content: initialContent,
            history: [initialContent],
            historyIndex: 0
        };

        this.setupEditor();
    }

    // Set up editor event listeners and initial content
    private setupEditor(): void {
        this.container.appendChild(this.editorElement);
        this.editorElement.innerHTML = this.state.content;

        // Handle selection changes
        document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));

        // Handle input events
        this.editorElement.addEventListener('input', this.handleInput.bind(this));

        // Handle paste events
        this.editorElement.addEventListener('paste', this.handlePaste.bind(this));

        // Handle keydown events
        this.editorElement.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    // Selection change handler
    private handleSelectionChange(): void {
        if (this.isUpdating) return;

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (this.editorElement.contains(range.commonAncestorContainer)) {
                this.state.selection = {
                    start: this.getTextOffset(range.startContainer, range.startOffset),
                    end: this.getTextOffset(range.endContainer, range.endOffset)
                };
            }
        }
    }

    // Input handler
    private handleInput(_event: Event): void {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            const newContent = this.editorElement.innerHTML;
            this.updateContent(newContent);
            this.normalizeContent();
        } finally {
            this.isUpdating = false;
        }
    }

    // Paste handler with HTML sanitization
    private handlePaste(event: ClipboardEvent): void {
        event.preventDefault();

        const clipboardData = event.clipboardData;
        if (!clipboardData) return;

        // Try to get HTML content first
        let content = clipboardData.getData('text/html');

        // Fall back to plain text if no HTML
        if (!content) {
            content = clipboardData.getData('text/plain');
            content = content.replace(/\n/g, '<br>');
        }

        // Sanitize and insert content
        const sanitizedContent = this.sanitizeHtml(content);
        this.insertContent(sanitizedContent);
    }

    // Add this method to the ModernEditor class
    private insertContent(content: string): void {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        // Get the current range
        const range = selection.getRangeAt(0);

        // Create a temporary container for the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Handle multi-node content
        if (tempDiv.childNodes.length > 1) {
            // Create document fragment to hold all nodes
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }

            // Delete current selection if any
            range.deleteContents();

            // Insert the fragment
            range.insertNode(fragment);
        } else {
            // Simple single node insertion
            range.deleteContents();
            range.insertNode(tempDiv.firstChild!);
        }

        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Normalize and update content
        this.normalizeContent();
        this.updateContent(this.editorElement.innerHTML);
    }

    // Optional: Add a public method for external content insertion
    public insert(content: string): void {
        const sanitizedContent = this.sanitizeHtml(content);
        this.insertContent(sanitizedContent);
    }

    // Key handler for special commands (ctrl+b, etc)
    private handleKeyDown(event: KeyboardEvent): void {
        // Handle keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'b':
                    event.preventDefault();
                    this.toggleFormat('strong');
                    break;
                case 'i':
                    event.preventDefault();
                    this.toggleFormat('em');
                    break;
                case 'u':
                    event.preventDefault();
                    this.toggleFormat('u');
                    break;
                case 'z':
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

    // Calculate text offset for a given node and position
    private getTextOffset(node: Node, offset: number): number {
        let totalOffset = 0;
        const walker = document.createTreeWalker(
            this.editorElement,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as HTMLElement;
                        if (getComputedStyle(element).display === 'none') {
                            return NodeFilter.FILTER_REJECT;
                        }
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let found = false;
        while (walker.nextNode() && !found) {
            const currentNode = walker.currentNode;

            if (currentNode === node) {
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    totalOffset += offset;
                }
                found = true;
                break;
            }

            if (currentNode.nodeType === Node.TEXT_NODE) {
                totalOffset += currentNode.textContent?.length || 0;
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const element = currentNode as HTMLElement;
                const config = this.elementConfigs[element.tagName.toLowerCase()];

                if (config) {
                    if (config.replacedElement) {
                        totalOffset += config.visualLength;
                    }
                    if (config.blockElement && totalOffset > 0) {
                        totalOffset += config.visualLength;
                    }
                }
            }
        }

        return totalOffset;
    }

    // Update content and save to history
    private updateContent(newContent: string): void {
        if (newContent !== this.state.content) {
            // Add to history
            this.state.history = [
                ...this.state.history.slice(0, this.state.historyIndex + 1),
                newContent
            ];
            this.state.historyIndex++;
            this.state.content = newContent;
            this.onChange?.(newContent);
        }
    }

    // Normalize HTML content
    public normalizeContent(): void {
        if (!this.editorElement) return;

        // Merge adjacent identical inline elements
        const mergeableElements = ['strong', 'em', 'u', 'strike', 's', 'code', 'mark'];

        mergeableElements.forEach(tagName => {
            const elements = this.editorElement.getElementsByTagName(tagName);
            for (let i = elements.length - 1; i > 0; i--) {
                const current = elements[i];
                const previous = elements[i - 1];

                if (current.previousSibling === previous) {
                    if (current.getAttribute('style') === previous.getAttribute('style')) {
                        while (current.firstChild) {
                            previous.appendChild(current.firstChild);
                        }
                        current.remove();
                    }
                }
            }
        });

        // Ensure proper block structure
        if (!this.editorElement.querySelector('p, div, h1, h2, h3, h4, h5, h6')) {
            const content = this.editorElement.innerHTML;
            this.editorElement.innerHTML = `<p>${content}</p>`;
        }
    }

    // Public API methods
    public toggleFormat(tagName: string): void {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const element = document.createElement(tagName);

        try {
            range.surroundContents(element);
        } catch (e) {
            // Handle complex selections
            const fragment = range.extractContents();
            element.appendChild(fragment);
            range.insertNode(element);
        }

        this.normalizeContent();
        this.updateContent(this.editorElement.innerHTML);
    }

    public undo(): void {
        if (this.state.historyIndex > 0) {
            this.state.historyIndex--;
            this.editorElement.innerHTML = this.state.history[this.state.historyIndex];
            this.state.content = this.state.history[this.state.historyIndex];
        }
    }

    public redo(): void {
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.historyIndex++;
            this.editorElement.innerHTML = this.state.history[this.state.historyIndex];
            this.state.content = this.state.history[this.state.historyIndex];
        }
    }

    // HTML sanitization
    private sanitizeHtml(html: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const allowedTags = Object.keys(this.elementConfigs);
        const allowedAttributes = ['href', 'src', 'alt', 'title', 'style'];

        const sanitize = (node: Node): Node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const tagName = element.tagName.toLowerCase();

                if (!allowedTags.includes(tagName)) {
                    const wrapper = document.createDocumentFragment();
                    while (element.firstChild) {
                        wrapper.appendChild(sanitize(element.firstChild));
                    }
                    return wrapper;
                }

                // Remove disallowed attributes
                Array.from(element.attributes).forEach(attr => {
                    if (!allowedAttributes.includes(attr.name)) {
                        element.removeAttribute(attr.name);
                    }
                });

                // Sanitize children
                Array.from(element.childNodes).forEach(child => {
                    sanitize(child);
                });
            }

            return node;
        };

        sanitize(doc.body);
        return doc.body.innerHTML;
    }

    // Add these new methods
    public updateBindings(newBindings: Record<string, any>): void {
        this.bindings = newBindings;
        this.processBindings();
    }

    private processBindings(): void {
        const content = this.editorElement.innerHTML;
        const processedContent = this.processBindingsInContent(content);
        this.editorElement.innerHTML = processedContent;
    }

    private processBindingsInContent(text: string): string {
        return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            const value = trimmedKey.split('.').reduce((acc: any, part: string) => acc && acc[part], this.bindings);
            return `<span class="template-binding" data-binding="${trimmedKey}">${value !== undefined ? value : match}</span>`;
        });
    }

    public applyTemplate(template: Template): void {
        const processedContent = this.processBindingsInContent(template.content);
        this.editorElement.innerHTML = processedContent;
        this.updateContent(processedContent);
    }

    // Add formatting methods
    public applyFormat(format: string, attributes?: Record<string, string>): void {
        if (attributes) {
            const element = document.createElement(format);
            for (const [key, value] of Object.entries(attributes)) {
                element.setAttribute(key, value);
            }
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.surroundContents(element);
            }
            this.normalizeContent();
        } else {
            this.toggleFormat(format);
        }
    }

    public insertTable(rows: number, columns: number, styles: { borderColor: string, cellPadding: string }): void {
        let tableHTML = `<table style="border-color: ${styles.borderColor}; border-collapse: collapse;">`;
        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < columns; j++) {
                tableHTML += `<td style="border: 1px solid ${styles.borderColor}; padding: ${styles.cellPadding};">&nbsp;</td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</table>';
        this.insert(tableHTML);
    }

    // Public API methods for formatting
    public format(command: string, value?: string): void {
        switch (command) {
            case 'bold':
                this.applyFormat('strong');
                break;
            case 'italic':
                this.applyFormat('em');
                break;
            case 'underline':
                this.applyFormat('u');
                break;
            case 'align':
                this.applyFormat('div', { style: `text-align: ${value || 'left'}` });
                break;
            case 'list':
                this.applyFormat(value === 'ordered' ? 'ol' : 'ul');
                break;
            default:
                this.applyFormat(command);
        }
    }

    // Public insert methods
    public insertLink(url: string, text?: string): void {
        const linkText = text || url;
        const linkHtml = `<a href="${url}">${linkText}</a>`;
        this.insert(linkHtml);
    }

    public insertImage(url: string, alt?: string): void {
        const imgHtml = `<img src="${url}" alt="${alt || ''}" />`;
        this.insert(imgHtml);
    }
}

// React component wrapper
interface RichEditorProps {
    content: string;
    onChange: (content: string) => void;
    bindings?: Record<string, any>;
    templates?: Template[];
    debug?: boolean;
    className?: string;
}

const ModernEditorComponent: React.FC<RichEditorProps> = ({
    content,
    onChange,
    bindings,
    templates,
    debug,
    className
}) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const editorInstanceRef = React.useRef<RichEditor | null>(null);

    const [selectionState, setSelectionState] = useState<{
        isCollapsed: boolean;
        start: number;
        end: number;
        length: number;
    } | null>(null);
    
    React.useEffect(() => {
        if (editorRef.current && !editorInstanceRef.current) {
            editorInstanceRef.current = new RichEditor(editorRef.current, content, {
                bindings,
                templates,
                onChange,
                debug
            });
        }
        if (debug) {
            // Add selection change listener for debug panel
            document.addEventListener('selectionchange', () => {
              if (editorInstanceRef.current) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  setSelectionState({
                    isCollapsed: range.collapsed,
                    start: range.startOffset,
                    end: range.endOffset,
                    length: range.endOffset - range.startOffset
                  });
                }
              }
            });
          }
    }, []);

    React.useEffect(() => {
        if (editorInstanceRef.current && bindings) {
            editorInstanceRef.current.updateBindings(bindings);
        }
    }, [bindings]);

    return (
        <div className="modern-editor-container">
            <Toolbar
                onFormat={(format, attrs) => editorInstanceRef.current?.applyFormat(format, attrs)}
                onTable={(rows, cols, styles) => editorInstanceRef.current?.insertTable(rows, cols, styles)}
                onTemplate={(template) => editorInstanceRef.current?.applyTemplate(template)}
                templates={templates}
            />
            <div ref={editorRef} className={className} />
            {debug && <DebugPanel selectionState={selectionState} />}
        </div>
    );
};

export { ModernEditorComponent, RichEditor, type Template };

