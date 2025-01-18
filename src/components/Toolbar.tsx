import React, { useState } from "react";
import { TableStyles, ToolbarProps } from "../types/ToolbarTypes";

const icons = {
  bold: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>,
  italic: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>,
  underline: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>,
  alignLeft: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>,
  alignCenter: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>,
  alignRight: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>,
  bulletList: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><circle cx="5" cy="6" r="2"></circle><circle cx="5" cy="12" r="2"></circle><circle cx="5" cy="18" r="2"></circle></svg>,
  numberList: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>,
  table: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
};

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onTable,
  onTemplate,
  templates = [],
}) => {
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);

  const defaultTableStyles: TableStyles = {
    borderColor: '#ccc',
    cellPadding: '8px',
  };

  return (
    <div className="wysiwyg-toolbar">
      {/* Text formatting */}
      <div className="toolbar-group">
        <button onClick={() => onFormat('strong')} title="Bold">{icons.bold}</button>
        <button onClick={() => onFormat('em')} title="Italic">{icons.italic}</button>
        <button onClick={() => onFormat('u')} title="Underline">{icons.underline}</button>
      </div>

      {/* Alignment */}
      <div className="toolbar-group">
        <button onClick={() => onFormat('div', { style: 'text-align: left' })} title="Align Left">{icons.alignLeft}</button>
        <button onClick={() => onFormat('div', { style: 'text-align: center' })} title="Align Center">{icons.alignCenter}</button>
        <button onClick={() => onFormat('div', { style: 'text-align: right' })} title="Align Right">{icons.alignRight}</button>
      </div>

      {/* Lists */}
      <div className="toolbar-group">
        <button onClick={() => onFormat('ul')} title="Bullet List">{icons.bulletList}</button>
        <button onClick={() => onFormat('ol')} title="Number List">{icons.numberList}</button>
      </div>

      {/* Table insertion */}
      <div className="toolbar-group">
        <div className="table-menu">
          <button onClick={() => setShowTableMenu(!showTableMenu)} title="Insert Table">{icons.table}</button>
          {showTableMenu && (
            <div className="table-popup">
              <div>
                <label>Rows: </label>
                <input
                  type="number"
                  min="1"
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                />
              </div>
              <div>
                <label>Columns: </label>
                <input
                  type="number"
                  min="1"
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value))}
                />
              </div>
              <button onClick={() => {
                onTable(tableRows, tableCols, defaultTableStyles);
                setShowTableMenu(false);
              }}>Insert Table</button>
            </div>
          )}
        </div>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div className="toolbar-group">
          <select onChange={(e) => {
            const template = templates.find(t => t.name === e.target.value);
            if (template) onTemplate(template);
          }}>
            <option value="">Select Template</option>
            {templates.map(template => (
              <option key={template.name} value={template.name}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};