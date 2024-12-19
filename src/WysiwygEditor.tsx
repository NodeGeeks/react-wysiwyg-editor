/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { DebugPanel } from './components/DebugPanel';
import { TemplateSelector } from './components/TemplateSelector';
import { Toolbar } from './components/Toolbar';
import "./styles.css";

interface Template {
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
      const value = bindings[trimmedKey];
      return `<span class="template-binding" data-binding="${trimmedKey}">${value !== undefined ? value : match}</span>`;
    });
  };

  const [, setEditorContent] = React.useState(content);
  const [history, setHistory] = React.useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [selectionState, setSelectionState] = React.useState<SelectionState | null>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isUpdatingRef = React.useRef(false);

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
      end: endPos
    };
  };

  // Function to set caret position
  const setCaretPosition = (selection: SelectionState) => {
    setSelectionState(selection);
    if (!editorRef.current) return;
  
    const domSelection = window.getSelection();
    if (!domSelection) return;
  
    let charCount = 0;
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;
  
    const walk = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
  
    // Find start and end positions
    while ((startNode = walk.nextNode())) {
      const nodeLength = startNode.textContent?.length || 0;
      if (charCount + nodeLength >= selection.start) {
        startOffset = selection.start - charCount;
        endNode = startNode;
        endOffset = selection.end - charCount;
        
        // If end position is in a different node, keep walking
        if (charCount + nodeLength < selection.end) {
          while ((endNode = walk.nextNode())) {
            const length = endNode.textContent?.length || 0;
            charCount += length;
            if (charCount >= selection.end) {
              endOffset = selection.end - (charCount - length);
              break;
            }
          }
        }
        break;
      }
      charCount += nodeLength;
    }
  
    if (startNode) {
      try {
        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode || startNode, endOffset);
        domSelection.removeAllRanges();
        domSelection.addRange(range);
      } catch (e) {
        console.warn('Failed to restore selection:', e);
      }
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
        const value = bindings[binding];
        span.textContent = value !== undefined ? value : `{{${binding}}}`;
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

  return (
    <div className="wysiwyg-container">
      <Toolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onFontSize={handleFontSize}
        onFontFamily={handleFontFamily}
        onColor={handleColor}
        onLink={handleLink}
        onImage={handleImage}
        onTemplate={() => {console.log("")}}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAlignLeft={handleAlignLeft}
        onAlignCenter={handleAlignCenter}
        onAlignRight={handleAlignRight}
        onBulletList={handleBulletList}
        onOrderedList={handleOrderedList}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
      />
      {templates.length > 0 && (
        <TemplateSelector
          templates={templates}
          onSelectTemplate={handleTemplate}
        />
      )}
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
                document.execCommand('insertHTML', false, '<br><br>');
                
                // Force refresh to ensure proper layout
                const content = editorRef.current.innerHTML;
                editorRef.current.innerHTML = content;
                
                // Move cursor to end of inserted breaks
                const walker = document.createTreeWalker(
                  editorRef.current,
                  NodeFilter.SHOW_ELEMENT,
                  {
                    acceptNode: (node) => 
                      node.nodeName === 'BR' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                  }
                );
                
                let lastBr: Node | null = null;
                let node: Node | null;
                while ((node = walker.nextNode())) {
                  lastBr = node;
                }
                
                if (lastBr) {
                  range.setStartAfter(lastBr);
                  range.setEndAfter(lastBr);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
                
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
