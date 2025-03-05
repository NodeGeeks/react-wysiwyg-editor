import { useEffect, useState } from "react";

/**
 * Interface representing the formatting state of the editor
 * @interface
 */
export interface FormatState {
    /** Whether the text is bold */
    isBold: boolean;
    /** Whether the text is italic */
    isItalic: boolean;
    /** Whether the text is underlined */
    isUnderline: boolean;
    /** Whether the text is left-aligned */
    isAlignLeft: boolean;
    /** Whether the text is center-aligned */
    isAlignCenter: boolean;
    /** Whether the text is right-aligned */
    isAlignRight: boolean;
    /** Whether the text is in a bullet list */
    isBulletList: boolean;
    /** Whether the text is in an ordered list */
    isOrderedList: boolean;
    /** The current font size with unit (e.g., "16px") */
    currentFontSize: string;
    /** The current font family name */
    currentFontFamily: string;
    /** The current text color in hexadecimal format */
    currentColor: string;
}

/**
 * A custom React hook that manages the formatting state of a rich text editor
 * @param {React.RefObject<HTMLDivElement>} editorRef - Reference to the editor's DOM element
 * @returns {FormatState} An object containing the current formatting state
 * @description
 * This hook tracks various text formatting properties including:
 * - Bold, italic, and underline states
 * - Text alignment (left, center, right)
 * - List types (bullet and ordered)
 * - Font properties (size, family, color)
 * 
 * The hook automatically updates these states based on the current text selection
 * in the editor.
 */
export const useFormatState = (editorRef: React.RefObject<HTMLDivElement>): FormatState => {
    const [formatState, setFormatState] = useState<FormatState>({
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isAlignLeft: false,
        isAlignCenter: false,
        isAlignRight: false,
        isBulletList: false,
        isOrderedList: false,
        currentFontSize: "16px",
        currentFontFamily: "Arial",
        currentColor: "#000000"
    });

    /**
     * Effect hook that sets up event listeners for selection changes and updates format state
     */
    useEffect(() => {
        /**
         * Checks and updates the formatting state based on the current text selection
         */
        const checkFormatting = () => {
            if (!editorRef.current) return;

            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const parentElement = range.commonAncestorContainer as HTMLElement;

            // Helper function to get computed style
            /**
             * Helper function to get computed style of an element
             * @param {HTMLElement} element - The DOM element to get styles from
             * @param {string} property - The CSS property name to retrieve
             * @returns {string} The computed style value
             */
            const getStyle = (element: HTMLElement, property: string) => {
                return window.getComputedStyle(element)[property as any];
            };

            // Get the element to check styles
            // Get the common ancestor element and check if it's a text node
            const elementToCheck = parentElement.nodeType === 3 ? parentElement.parentElement : parentElement;
            if (!elementToCheck) return;

            // Check if we have any selected text
            const hasSelection = !selection.isCollapsed;

            // Helper function to check if format is active for a node
            const isFormatActiveForNode = (node: Node, command: string) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;
                    switch (command) {
                    case "bold":
                        return element.style.fontWeight === "bold" || element.tagName === "B" || element.tagName === "STRONG";
                    case "italic":
                        return element.style.fontStyle === "italic" || element.tagName === "I" || element.tagName === "EM";
                    case "underline":
                        return element.style.textDecoration === "underline" || element.tagName === "U";
                    default:
                        return false;
                    }
                }
                return false;
            };

            // If we have selected text, check the common formatting
            const isFormatActiveForSelection = (command: string): string | boolean => {
                if (!hasSelection) {
                    // If no selection, check the current position
                    return elementToCheck ? isFormatActiveForNode(elementToCheck, command) : false;
                }

                // For selections, check if all selected content has the format
                const ancestor = range.commonAncestorContainer;
                const selectedNodes = [];

                // Get all nodes within selection
                const nodeIterator = document.createNodeIterator(
                    ancestor,
                    NodeFilter.SHOW_ELEMENT,
                    {
                        acceptNode: (node) => {
                            const nodeRange = document.createRange();
                            nodeRange.selectNodeContents(node);
                            return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                        }
                    }
                );

                let currentNode;
                while ((currentNode = nodeIterator.nextNode())) {
                    selectedNodes.push(currentNode);
                }

                // If no nodes found, check the ancestor
                if (selectedNodes.length === 0) {
                    return isFormatActiveForNode(ancestor, command);
                }

                // Check formatting across all selected nodes
                let hasFormatted = false;
                let hasUnformatted = false;

                selectedNodes.forEach((node) => {
                    const selRange = document.createRange();
                    selRange.selectNodeContents(node);
                    if (selRange.intersectsNode(node)) {
                        if (isFormatActiveForNode(node, command)) {
                            hasFormatted = true;
                        } else {
                            hasUnformatted = true;
                        }
                    }
                });

                // If mixed formatting, return special state
                if (hasFormatted && hasUnformatted) {
                    return "-";
                }

                // Return true only if all selected content has the format
                return hasFormatted && !hasUnformatted;
            };
      
            setFormatState({
                isBold: isFormatActiveForSelection("bold") === "-" ? false : !!isFormatActiveForSelection("bold"),
                isItalic: isFormatActiveForSelection("italic") === "-" ? false : !!isFormatActiveForSelection("italic"),
                isUnderline: isFormatActiveForSelection("underline") === "-" ? false : !!isFormatActiveForSelection("underline"),
                isAlignLeft: getStyle(elementToCheck, "textAlign") === "left",
                isAlignCenter: getStyle(elementToCheck, "textAlign") === "center",
                isAlignRight: getStyle(elementToCheck, "textAlign") === "right",
                isBulletList: !!elementToCheck.closest("ul"),
                isOrderedList: !!elementToCheck.closest("ol"),
                currentFontSize: getStyle(elementToCheck, "fontSize"),
                currentFontFamily: getStyle(elementToCheck, "fontFamily").replace(/['"]/g, ""),
                currentColor: getStyle(elementToCheck, "color")
            });
        };

        // Add selection change listener
        const handleSelectionChange = () => {
            requestAnimationFrame(() => {
                checkFormatting();
            });
        };

        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, [editorRef]);

    return formatState;
};