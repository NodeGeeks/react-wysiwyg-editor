/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { DebugPanel } from './components/DebugPanel';
import { Toolbar } from './components/Toolbar';
import "./styles.css";
import { TableStyles } from './types/TableStyles';

export interface Template {
  name: string;
  content: string;
}

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  bindings?: Record<string, any>;
  templates?: Template[];
  debug?: boolean;
}
interface SelectionState {
  isCollapsed: boolean;
  start: number;
  end: number;
  length: number;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  content,
  onChange,
  bindings = {},
  templates = [],
  debug = false
}) => {
  const processBindings = (text: string) => {
    if (!text) return '';
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      const value: any = trimmedKey.split('.').reduce((acc: any, part: string) => acc && acc[part], bindings);
      return `<span class="template-binding" data-binding="${trimmedKey}">${value !== undefined ? value : match}</span>`;
    });
  };

  const [, setEditorContent] = React.useState(content);
  const [history, setHistory] = React.useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [selectionState, setSelectionState] = React.useState<SelectionState | null>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isUpdatingRef = React.useRef(false);
  const [storedSelection, setStoredSelection] = React.useState<Range | null>(null);
  const [showTablePopover, setShowTablePopover] = React.useState(false);
  const tablePopoverRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      editorRef.current &&
      !editorRef.current.contains(event.target as Node) &&
      tablePopoverRef.current &&
      !tablePopoverRef.current.contains(event.target as Node)
    ) {
      setShowTablePopover(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to get current caret position including <br> elements
  const getCaretPosition = () => {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount || !editorRef.current) return null;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    const nodes = Array.from(editorRef.current.childNodes);
    let startPos = 0;
    let endPos = 0;
    let hasStartContainer = false;

    const countPosition = (node: Node): number => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.length || 0;
      } else if (node.nodeName === 'BR') {
        return 1; // Count each <br> as one position
      }
      let length = 0;
      node.childNodes.forEach(child => {
        length += countPosition(child);
      });
      return length;
    };

    // Calculate positions including <br> elements
    for (const node of nodes) {
      if (!hasStartContainer) {
        if (node.contains(range.startContainer)) {
          hasStartContainer = true;
          if (node === range.startContainer) {
            startPos += range.startOffset;
          } else {
            startPos += countPosition(node);
          }
        } else {
          startPos += countPosition(node);
        }
      }
      if (node.contains(range.endContainer)) {
        if (node === range.endContainer) {
          endPos = startPos + (range.endOffset - range.startOffset);
        } else {
          endPos = startPos + countPosition(node);
        }
        break;
      }
    }

    return {
      isCollapsed: range.collapsed,
      start: startPos,
      end: endPos,
      length: endPos - startPos
    };
  };

  // Function to set caret position
  // Updated setCaretPosition function with fix for HTML nodes
  const setCaretPosition = (selection: SelectionState) => {
    setSelectionState(selection);
    if (!editorRef.current) return;

    const domSelection = window.getSelection();
    if (!domSelection) return;

    let currentPos = 0;
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;

    const findPosition = (targetPos: number, node: Node): { node: Node, offset: number } | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        const length = node.textContent?.length || 0;
        if (currentPos + length >= targetPos) {
          return {
            node: node,
            offset: targetPos - currentPos
          };
        }
        currentPos += length;
        return null;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const result = findPosition(targetPos, node.childNodes[i]);
          if (result) return result;
        }
      }

      return null;
    };

    try {
      // Find start position
      const startResult = findPosition(selection.start, editorRef.current);
      if (startResult) {
        startNode = startResult.node;
        startOffset = startResult.offset;
      }

      // Reset currentPos for end position calculation
      currentPos = 0;
      // Find end position
      const endResult = findPosition(selection.end, editorRef.current);
      if (endResult) {
        endNode = endResult.node;
        endOffset = endResult.offset;
      }

      if (startNode && endNode) {
        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        domSelection.removeAllRanges();
        domSelection.addRange(range);
      }
    } catch (e) {
      console.warn('Failed to restore selection:', e);
    }
  };

  // Set initial content
  React.useEffect(() => {
    if (editorRef.current) {
      const processedContent = processBindings(content);
      editorRef.current.innerHTML = processedContent;
      setEditorContent(content);
    }
    if (debug) {
      const handleSelectionChange = () => {
        const newSelectionState = getCaretPosition();
          if (newSelectionState) {
              setSelectionState(newSelectionState);
          }
      };

      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
          document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, []);

  // Update content when content or bindings change
  React.useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const processedContent = processBindings(content);
      editorRef.current.innerHTML = processedContent;
      setEditorContent(content);
    }
  }, [content]);

  // Handle binding updates
  React.useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return;
    const spans = editorRef.current.querySelectorAll('.template-binding');
    spans.forEach((span) => {
      const binding = span.getAttribute('data-binding');
      if (binding) {
        const value = binding.split('.').reduce((acc, part) => acc && acc[part], bindings);
        span.textContent = value !== undefined ? String(value) : `{{${binding}}}`;
      }
    });
  }, [bindings]);

  const saveToHistory = (newContent: string) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleChange = (event: React.FormEvent<HTMLDivElement>) => {
    if (!editorRef.current || isUpdatingRef.current) return;
  
    isUpdatingRef.current = true;
    const selectionState = getCaretPosition();
    
    const newContent = event.currentTarget.innerHTML;
    setEditorContent(newContent);
    onChange(newContent);
    saveToHistory(newContent);
  
    // Restore selection after state updates
    requestAnimationFrame(() => {
      if (selectionState) {
        setCaretPosition(selectionState);
      }
      isUpdatingRef.current = false;
    });
  };

  const execCommand = (command: string, value: string | boolean | number = false) => {
    if (!editorRef.current) return;
  
    editorRef.current.focus();
    const selectionState = getCaretPosition();
    
    try {
      document.execCommand(command, false, value.toString());
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onChange(newContent);
      saveToHistory(newContent);
  
      // Restore selection after command execution
      requestAnimationFrame(() => {
        if (selectionState) {
          setCaretPosition(selectionState);
        }
      });
    } catch (e) {
      console.warn('execCommand failed:', e);
    }
  };

  const handleBold = () => {
    execCommand('bold');
  };

  const handleItalic = () => {
    execCommand('italic');
  };

  const handleUnderline = () => {
    execCommand('underline');
  };

  const handleFontSize = (size: string) => {
    const sizeNum = parseInt(size);
    const fontSizeValue = Math.min(7, Math.max(1, Math.floor(sizeNum / 4)));
    execCommand('fontSize', fontSizeValue);
  };

  const handleColor = (color: string) => {
    execCommand('foreColor', color);
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousContent = history[historyIndex - 1];
      if (editorRef.current) {
        const selectionState = getCaretPosition();
        editorRef.current.innerHTML = previousContent;
        setEditorContent(previousContent);
        onChange(previousContent);
        
        requestAnimationFrame(() => {
          if (selectionState) {
            setCaretPosition(selectionState);
          }
        });
      }
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextContent = history[historyIndex + 1];
      if (editorRef.current) {
        const selectionState = getCaretPosition();
        editorRef.current.innerHTML = nextContent;
        setEditorContent(nextContent);
        onChange(nextContent);
        
        requestAnimationFrame(() => {
          if (selectionState) {
            setCaretPosition(selectionState);
          }
        });
      }
    }
  };

  const handleAlignLeft = () => {
    execCommand('justifyLeft');
  };

  const handleAlignCenter = () => {
    execCommand('justifyCenter');
  };

  const handleAlignRight = () => {
    execCommand('justifyRight');
  };

  const handleBulletList = () => {
    execCommand('insertUnorderedList');
  };

  const handleOrderedList = () => {
    execCommand('insertOrderedList');
  };

  const handleIndent = () => {
    execCommand('indent');
  };

  const handleOutdent = () => {
    execCommand('outdent');
  };

  const handleFontFamily = (font: string) => {
    execCommand('fontName', font);
  };
  
  const handleTemplate = (template: Template) => {
    if (editorRef.current) {
      const selectionState = getCaretPosition();
      const processedContent = processBindings(template.content);
      editorRef.current.innerHTML = processedContent;
      setEditorContent(template.content);
      onChange(template.content);
      saveToHistory(template.content);
  
      requestAnimationFrame(() => {
        if (selectionState) {
          setCaretPosition(selectionState);
        }
      });
    }
  };

  const handleTable = (rows: number, columns: number, styles: TableStyles) => {
    if (!editorRef.current || !storedSelection) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(storedSelection);

    let tableHTML = `<table style="border-color: ${styles.borderColor}; border-collapse: collapse;">`;
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < columns; j++) {
        tableHTML += `<td style="border: 1px solid ${styles.borderColor}; padding: ${styles.cellPadding};">&nbsp;</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tableHTML;
    const fragment = document.createDocumentFragment();
    let node;
    while ((node = tempDiv.firstChild)) {
      fragment.appendChild(node);
    }

    storedSelection.deleteContents();
    storedSelection.insertNode(fragment);

    // Move the caret after the inserted table
    const lastChild = fragment.lastChild;
    if (lastChild) {
      storedSelection.setStartAfter(lastChild);
      storedSelection.setEndAfter(lastChild);
      selection.removeAllRanges();
      selection.addRange(storedSelection);
    }

    // Update the content and history
    const newContent = editorRef.current.innerHTML;
    setEditorContent(newContent);
    onChange(newContent);
    saveToHistory(newContent);
  };

  return (
    <div className="wysiwyg-container" style={{ position: 'relative' }}>
      <Toolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onFontSize={handleFontSize}
        onFontFamily={handleFontFamily}
        onColor={handleColor}
        onLink={handleLink}
        onImage={handleImage}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAlignLeft={handleAlignLeft}
        onAlignCenter={handleAlignCenter}
        onAlignRight={handleAlignRight}
        onBulletList={handleBulletList}
        onOrderedList={handleOrderedList}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        onTable={handleTable}
        onShowTablePopover={() => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            setStoredSelection(selection.getRangeAt(0));
          }
          setShowTablePopover(true);
        }}
        showTablePopover={showTablePopover}
        setShowTablePopover={setShowTablePopover}
        tablePopoverRef={tablePopoverRef}
        templates={templates}
        onSelectTemplate={handleTemplate}
      />
      <div
        ref={editorRef}
        className="nodegeeks-react-wysiwyg-editor"
        contentEditable
        onInput={handleChange}
        onKeyDown={(e) => {
          // Prevent default behavior for tab key
          if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '\t');
          }
          // Handle Enter key to maintain cursor position
          else if (e.key === 'Enter') {
            e.preventDefault();
            if (editorRef.current) {
              const selection = document.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                
                // Handle any selected text first
                if (!range.collapsed) {
                  range.deleteContents();
                }
                
                // Save position and insert line breaks
                const br1 = document.createElement('br');
                const br2 = document.createElement('br');
                range.insertNode(br1);
                range.insertNode(br2);
                range.setStartAfter(br2);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Trigger onChange
                handleChange({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
              }
            }
          }
        }}
        suppressContentEditableWarning={true}
        role="textbox"
        aria-label="Rich text editor"
        spellCheck
      />
      {debug ? <DebugPanel selectionState={selectionState} /> : null}
    </div>
  );
};
