/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
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
    if (editorRef.current) {
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
    const newContent = event.currentTarget.innerHTML;
    setEditorContent(newContent);
    onChange(newContent);
    saveToHistory(newContent);
  };

  const execCommand = (command: string, value: string | boolean| number = false ) => {
    document.execCommand(command, false, value.toString());
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onChange(newContent);
      saveToHistory(newContent);
    }
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleFontSize = (size: string) => {
    // Convert pixel size to 1-7 scale that execCommand expects
    const sizeNum = parseInt(size);
    const fontSizeValue = Math.min(7, Math.max(1, Math.floor(sizeNum / 4)));
    execCommand('fontSize', fontSizeValue);
  };
  const handleColor = (color: string) => execCommand('foreColor', color);
  
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
      setEditorContent(previousContent);
      onChange(previousContent);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextContent = history[historyIndex + 1];
      setEditorContent(nextContent);
      onChange(nextContent);
    }
  };

  const handleTemplate = (template: Template) => {
    const newContent = template.content;
    if (editorRef.current) {
      const processedContent = processBindings(newContent);
      editorRef.current.innerHTML = processedContent;
      setEditorContent(newContent);
      onChange(newContent);
      saveToHistory(newContent);
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
        suppressContentEditableWarning={true}
        role="textbox"
        aria-label="Rich text editor"
        spellCheck
        
      />
    </div>
  );
};