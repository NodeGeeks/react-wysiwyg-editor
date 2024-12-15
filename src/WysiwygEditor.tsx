import React from 'react';
import { TemplateSelector } from './components/TemplateSelector';
import { Toolbar } from './components/Toolbar';
import "./styles.module.css";

interface Template {
  name: string;
  content: string;
}

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  bindings?: Record<string, any>;
  templates?: Template[];
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
  templates = []
}) => {
  const processBindings = (text: string) => {
    if (!text) return '';
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = bindings[key.trim()];
      return value !== undefined ? value : match;
    });
  };

  const [, setEditorContent] = React.useState(content);
  const [history, setHistory] = React.useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isUpdatingRef = React.useRef(false);

  // Function to get current caret position
  const getCaretPosition = () => {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount) return null;
  
    const range = selection.getRangeAt(0);
    if (!editorRef.current) return null;
  
    // Get the start position
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const startPos = preCaretRange.toString().length;
  
    // Get the end position
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const endPos = preCaretRange.toString().length;
    
    return {
      isCollapsed: range.collapsed,
      start: startPos,
      end: endPos
    };
  };

  // Function to set caret position
  const setCaretPosition = (selection: SelectionState) => {
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
  }, []);

  // Update content when content or bindings change
  React.useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const processedContent = processBindings(content);
      editorRef.current.innerHTML = processedContent;
      setEditorContent(content);
    }
  }, [content, bindings]);

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
        onColor={handleColor}
        onLink={handleLink}
        onImage={handleImage}
        onTemplate={() => {console.log("")}}
        onUndo={handleUndo}
        onRedo={handleRedo}
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
        }}
        suppressContentEditableWarning={true}
        role="textbox"
        aria-label="Rich text editor"
        spellCheck
      />
    </div>
  );
};
