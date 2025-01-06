import React, { useEffect, useRef, useState } from 'react';
import { DebugPanel } from './components/DebugPanel';
import { Toolbar } from './components/Toolbar';
import { ModernEditor } from './ModernWysiwygEditor';
import { TableStyles } from './types/TableStyles';
import { Template } from './WysiwygEditor';

interface ModernEditorWrapperProps {
  content: string;
  onChange: (content: string) => void;
  bindings?: Record<string, any>;
  templates?: Template[];
  debug?: boolean;
  className?: string;
}

const ModernEditorWrapper: React.FC<ModernEditorWrapperProps> = ({
  content,
  bindings = {},
  templates = [],
  debug = false,
  className
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<ModernEditor | null>(null);
  const [showTablePopover, setShowTablePopover] = useState(false);
  const tablePopoverRef = useRef<HTMLDivElement>(null);
  const [selectionState, setSelectionState] = useState<{
    isCollapsed: boolean;
    start: number;
    end: number;
    length: number;
  } | null>(null);

  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      editorInstanceRef.current = new ModernEditor(editorRef.current, content);

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
    }
  }, []);

  // Handle binding updates
  useEffect(() => {
    if (editorInstanceRef.current) {
      const editor = editorInstanceRef.current;
      const processBindings = (text: string) => {
        return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
          const trimmedKey = key.trim();
          const value = trimmedKey.split('.').reduce((acc: any, part: string) => acc && acc[part], bindings);
          return `<span class="template-binding" data-binding="${trimmedKey}">${value !== undefined ? value : match}</span>`;
        });
      };

      const content = editor.editorElement.innerHTML;
      const processedContent = processBindings(content);
      editor.editorElement.innerHTML = processedContent;
    }
  }, [bindings]);

  const handleFormat = (format: string, attributes?: Record<string, string>) => {
    if (editorInstanceRef.current) {
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
        editorInstanceRef.current.normalizeContent();
      } else {
        editorInstanceRef.current.toggleFormat(format);
      }
    }
  };

  const handleTable = (rows: number, columns: number, styles: TableStyles) => {
    if (!editorInstanceRef.current) return;

    const editor = editorInstanceRef.current;
    let tableHTML = `<table style="border-color: ${styles.borderColor}; border-collapse: collapse;">`;
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < columns; j++) {
        tableHTML += `<td style="border: 1px solid ${styles.borderColor}; padding: ${styles.cellPadding};">&nbsp;</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';

    editor.insert(tableHTML);
    setShowTablePopover(false);
  };

  const handleTemplate = (template: Template) => {
    if (!editorInstanceRef.current) return;
    
    const processedContent = template.content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      const value = trimmedKey.split('.').reduce((acc: any, part: string) => acc && acc[part], bindings);
      return `<span class="template-binding" data-binding="${trimmedKey}">${value !== undefined ? value : match}</span>`;
    });

    editorInstanceRef.current.editorElement.innerHTML = processedContent;
  };

  return (
    <div className="modern-editor-container">
      <Toolbar
        onBold={() => handleFormat('strong')}
        onItalic={() => handleFormat('em')}
        onUnderline={() => handleFormat('u')}
        onFontSize={(size) => handleFormat('span', { style: `font-size: ${size}` })}
        onFontFamily={(font) => handleFormat('span', { style: `font-family: ${font}` })}
        onColor={(color) => handleFormat('span', { style: `color: ${color}` })}
        onLink={() => {
          const url = prompt('Enter URL:');
          if (url && editorInstanceRef.current) {
            editorInstanceRef.current.insert(`<a href="${url}">${url}</a>`);
          }
        }}
        onImage={() => {
          const url = prompt('Enter image URL:');
          if (url && editorInstanceRef.current) {
            editorInstanceRef.current.insert(`<img src="${url}" alt=""/>`);
          }
        }}
        onUndo={() => editorInstanceRef.current?.undo()}
        onRedo={() => editorInstanceRef.current?.redo()}
        onAlignLeft={() => handleFormat('div', { style: 'text-align: left' })}
        onAlignCenter={() => handleFormat('div', { style: 'text-align: center' })}
        onAlignRight={() => handleFormat('div', { style: 'text-align: right' })}
        onBulletList={() => handleFormat('ul')}
        onOrderedList={() => handleFormat('ol')}
        onIndent={() => handleFormat('div', { style: 'margin-left: 40px' })}
        onOutdent={() => handleFormat('div', { style: 'margin-left: 0px' })}
        onTable={handleTable}
        onShowTablePopover={() => setShowTablePopover(true)}
        showTablePopover={showTablePopover}
        setShowTablePopover={setShowTablePopover}
        tablePopoverRef={tablePopoverRef}
        templates={templates}
        onSelectTemplate={handleTemplate}
      />
      <div ref={editorRef} className={className} />
      {debug && <DebugPanel selectionState={selectionState} />}
    </div>
  );
};

export { ModernEditorWrapper };
