import React, { useState } from 'react';
import { TableStyles, ToolbarProps } from '../types/ToolbarTypes';

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
    <div className="editor-toolbar">
      {/* Text formatting */}
      <button onClick={() => onFormat('strong')}>B</button>
      <button onClick={() => onFormat('em')}>I</button>
      <button onClick={() => onFormat('u')}>U</button>

      {/* Alignment */}
      <button onClick={() => onFormat('div', { style: 'text-align: left' })}>Left</button>
      <button onClick={() => onFormat('div', { style: 'text-align: center' })}>Center</button>
      <button onClick={() => onFormat('div', { style: 'text-align: right' })}>Right</button>

      {/* Lists */}
      <button onClick={() => onFormat('ul')}>Bullet List</button>
      <button onClick={() => onFormat('ol')}>Number List</button>

      {/* Table insertion */}
      <div className="table-menu">
        <button onClick={() => setShowTableMenu(!showTableMenu)}>Table</button>
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

      {/* Templates */}
      {templates.length > 0 && (
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
      )}
    </div>
  );
};