import React, { useEffect } from "react";
import { FormatState } from "../hooks/useFormatState";
import "../styles/ExecCmdToolbar.css";
import { TableStyles } from "../types/TableStyles";
import { Template } from "../WysiwygEditor";
import { TablePopover } from "./TablePopover";

interface ToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onFontSize: (size: string) => void;
  onFontFamily: (font: string) => void;
  onColor: (color: string) => void;
  onLink: () => void;
  onImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onBulletList: () => void;
  onOrderedList: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onTable: (rows: number, columns: number, styles: TableStyles) => void;
  onShowTablePopover: () => void;
  showTablePopover: boolean;
  setShowTablePopover: (show: boolean) => void;
  tablePopoverRef: React.RefObject<HTMLDivElement>;
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  formatState: FormatState
}
const toolbarIcons = {
  bold: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-bold"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" /><path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" /></svg>,
  italic: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-italic"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 5l6 0" /><path d="M7 19l6 0" /><path d="M14 5l-4 14" /></svg>,
  strikethrough: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-strikethrough"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M16 6.5a4 2 0 0 0 -4 -1.5h-1a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-1.5a4 2 0 0 1 -4 -1.5" /></svg>,
  underline: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-underline"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 5v5a5 5 0 0 0 10 0v-5" /><path d="M5 19h14" /></svg>,
  alignLeft: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-align-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l10 0" /><path d="M4 18l14 0" /></svg>,
  alignRight: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-align-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M10 12l10 0" /><path d="M6 18l14 0" /></svg>,
  alignCenter: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-align-center"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M8 12l8 0" /><path d="M6 18l12 0" /></svg>,
  alignJustify: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-align-justified"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l12 0" /></svg>,
  unorderedList: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-list"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l11 0" /><path d="M9 12l11 0" /><path d="M9 18l11 0" /><path d="M5 6l0 .01" /><path d="M5 12l0 .01" /><path d="M5 18l0 .01" /></svg>,
  orderedList: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-list-numbers"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 6h9" /><path d="M11 12h9" /><path d="M12 18h8" /><path d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4" /><path d="M6 10v-6l-2 2" /></svg>,
  indentIncrease: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-indent-increase"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 6l-11 0" /><path d="M20 12l-7 0" /><path d="M20 18l-11 0" /><path d="M4 8l4 4l-4 4" /></svg>,
  indentDescrease: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-indent-decrease"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 6l-7 0" /><path d="M20 12l-9 0" /><path d="M20 18l-7 0" /><path d="M8 8l-4 4l4 4" /></svg>,
  link: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-link"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" /></svg>,
  image: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-photo"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" /><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" /></svg>,
  redo: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-forward-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 14l4 -4l-4 -4" /><path d="M19 10h-11a4 4 0 1 0 0 8h1" /></svg>,
  undo: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-back-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 14l-4 -4l4 -4" /><path d="M5 10h11a4 4 0 1 1 0 8h-1" /></svg>,
  table: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-table"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M3 10h18" /><path d="M10 3v18" /></svg>,
  blockqoute: <svg  xmlns="http://www.w3.org/2000/svg"  width="16" height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-blockquote"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15h15" /><path d="M21 19h-15" /><path d="M15 11h6" /><path d="M21 7h-6" /><path d="M9 9h1a1 1 0 1 1 -1 1v-2.5a2 2 0 0 1 2 -2" /><path d="M3 9h1a1 1 0 1 1 -1 1v-2.5a2 2 0 0 1 2 -2" /></svg>,
}
export const Toolbar: React.FC<ToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onFontSize,
  onFontFamily,
  onColor,
  onLink,
  onImage,
  onUndo,
  onRedo,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onBulletList,
  onOrderedList,
  onIndent,
  onOutdent,
  onTable,
  onShowTablePopover,
  showTablePopover,
  setShowTablePopover,
  tablePopoverRef,
  templates,
  onSelectTemplate,
  formatState,
}) => {
  const [highlightedTextColor, setHighlightedTextColor] = React.useState("black");
  const [showTemplateSelector, setShowTemplateSelector] = React.useState(false);
  const templateSelectorRef = React.useRef<HTMLDivElement>(null);
  
  // Close template selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateSelectorRef.current && !templateSelectorRef.current.contains(event.target as Node)) {
        setShowTemplateSelector(false);
      }
    };

    if (showTemplateSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTemplateSelector]);
  return (
    <div className="wysiwyg-toolbar">
      <div className="toolbar-group">
        <button onClick={onBold} title="Bold" className={formatState.isBold ? "active" : ""}>{toolbarIcons.bold}</button>
        <button onClick={onItalic} title="Italic" className={formatState.isItalic ? "active" : ""}>{toolbarIcons.italic}</button>
        <button onClick={onUnderline} title="Underline" className={formatState.isUnderline ? "active" : ""}>{toolbarIcons.underline}</button>
      </div>
      
      <div className="toolbar-group">
        <select onChange={(e) => onFontSize(e.target.value)} data-testid="font-size-select" title="Font Size">
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="24px">24px</option>
        </select>
        
        <select onChange={(e) => onFontFamily(e.target.value)} data-testid="font-family-select" title="Font Family">
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      
      <div className="toolbar-group">
        <button onClick={onAlignLeft} title="Align Left" className={formatState.isAlignLeft ? "active" : ""}>{toolbarIcons.alignLeft}</button>
        <button onClick={onAlignCenter} title="Align Center" className={formatState.isAlignCenter ? "active" : ""}>{toolbarIcons.alignCenter}</button>
        <button onClick={onAlignRight} title="Align Right" className={formatState.isAlignRight ? "active" : ""}>{toolbarIcons.alignRight}</button>
      </div>
      
      <div className="toolbar-group">
        <button onClick={onBulletList} title="Bullet List" className={formatState.isBulletList ? "active" : ""}>{toolbarIcons.unorderedList}</button>
        <button onClick={onOrderedList} title="Numbered List" className={formatState.isOrderedList ? "active" : ""}>{toolbarIcons.orderedList}</button>
        <button onClick={onIndent} title="Increase Indent">{toolbarIcons.indentIncrease}</button>
        <button onClick={onOutdent} title="Decrease Indent">{toolbarIcons.indentDescrease}</button>
      </div>
      
      <div className="toolbar-group">
        <div style={{ position: "relative", display: "inline-block" }}>
          <button 
            style={{
              background: "transparent",
              border: "none",
              borderBottom: `4px solid ${highlightedTextColor}`,
              padding: "10px 14px",
              position: "relative",
            }}
          >
            A
            <input
              data-testid="color-input"
              type="color"
              onChange={(e) => {
                setHighlightedTextColor(e.target.value);
                onColor(e.target.value);
              }}
              title="Text Color"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </button>
        </div>
        <button onClick={onLink} title="Add Link">{toolbarIcons.link}</button>
        <button onClick={onImage} title="Add Image">{toolbarIcons.image}</button>
      </div>
      
      <div className="toolbar-group">
        <button onClick={onUndo} title="Undo">{toolbarIcons.undo}</button>
        <button onClick={onRedo} title="Redo">{toolbarIcons.redo}</button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => {
            setShowTablePopover(!showTablePopover);
            onShowTablePopover();
          }}
          title="Insert Table"
        >
          {toolbarIcons.table}
        </button>
        {showTablePopover && (
          <TablePopover
            ref={tablePopoverRef}
            onSelect={(rows, columns, styles) => {
              onTable(rows, columns, styles);
              setShowTablePopover(false);
            }}
          />
        )}
      </div>

      <div className="toolbar-group">
        <div className="template-selector" ref={templateSelectorRef}>
          <button
            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            title="Template"
          >
            Template
          </button>
          {showTemplateSelector && (
            <select
              className="template-dropdown"
              size={5}
              onChange={(e) => {
                const selectedTemplate = templates.find(template => template.name === e.target.value);
                if (selectedTemplate) {
                  onSelectTemplate(selectedTemplate);
                  setShowTemplateSelector(false);
                }
              }}
            >
              {templates.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};