import { useEffect, useState } from "react";

export interface FormatState {
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isAlignLeft: boolean;
    isAlignCenter: boolean;
    isAlignRight: boolean;
    isBulletList: boolean;
    isOrderedList: boolean;
    currentFontSize: string;
    currentFontFamily: string;
    currentColor: string;
    canUndo: boolean;
    canRedo: boolean;
}

export const useFormatState = (
    editorRef: React.RefObject<HTMLDivElement>, 
    historyIndex = 0, 
    historyLength = 1
): FormatState => {
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
        currentColor: "#000000",
        canUndo: false,
        canRedo: false
    });

    useEffect(() => {
        // Update undo/redo state based on history
        setFormatState(prevState => ({
            ...prevState,
            canUndo: historyIndex > 0,
            canRedo: historyIndex < historyLength - 1
        }));
    }, [historyIndex, historyLength]);

    useEffect(() => {
        const checkFormatting = () => {
            if (!editorRef.current) return;

            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const parentElement = range.commonAncestorContainer as HTMLElement;

            // Helper function to get computed style
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
                currentColor: getStyle(elementToCheck, "color"),
                canRedo: historyIndex < historyLength - 1,
                canUndo: historyIndex > 0
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