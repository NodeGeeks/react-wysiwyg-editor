import React, { useState, useRef, useEffect } from 'react';

interface TableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (rows: number, cols: number) => void;
}

export const TableDialog: React.FC<TableDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });
  const [dimensions, setDimensions] = useState({ rows: 4, cols: 4 });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMouseEnter = (row: number, col: number) => {
    setHoveredCell({ row, col });
    // Update dimensions to show one more row and column when hovering over edge cells
    setDimensions({
      rows: row === 3 ? 5 : 4,
      cols: col === 3 ? 5 : 4,
    });
  };

  if (!isOpen) return null;

  const cells = [];
  for (let i = 0; i < dimensions.rows; i++) {
    for (let j = 0; j < dimensions.cols; j++) {
      const isHighlighted = i <= hoveredCell.row && j <= hoveredCell.col;
      cells.push(
        <div
          key={`${i}-${j}`}
          className={`table-cell ${isHighlighted ? 'highlighted' : ''}`}
          onMouseEnter={() => handleMouseEnter(i, j)}
          onClick={() => onSelect(hoveredCell.row + 1, hoveredCell.col + 1)}
          style={{
            width: '24px',
            height: '24px',
            border: '1px solid #ddd',
            backgroundColor: isHighlighted ? '#e6f3ff' : '#f5f5f5',
            boxShadow: isHighlighted ? '0 0 0 1px #0077ff' : 'none',
            cursor: 'pointer',
          }}
        />
      );
    }
  }

  return (
    <div
      ref={dialogRef}
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dimensions.cols}, 24px)`,
          gap: '2px',
        }}
      >
        {cells}
      </div>
      <div
        style={{
          marginTop: '8px',
          textAlign: 'center',
          color: '#666',
          fontSize: '12px',
        }}
      >
        {hoveredCell.row + 1} x {hoveredCell.col + 1} Table
      </div>
    </div>
  );
};