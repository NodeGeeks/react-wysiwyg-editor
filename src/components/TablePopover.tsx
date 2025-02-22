import { forwardRef, useState } from "react";
import { TableStyles } from "../types/TableStyles";
import "./TablePopover.css";

interface TablePopoverProps {
    onSelect: (rows: number, columns: number, styles: TableStyles) => void;
}

const TablePopover = forwardRef<HTMLDivElement, TablePopoverProps>(({ onSelect }, ref) => {
    const [rows, setRows] = useState(0);
    const [columns, setColumns] = useState(0);
    const [borderColor, setBorderColor] = useState("#000000");
    const [cellPadding, setCellPadding] = useState("5px");

    const handleMouseOver = (row: number, column: number) => {
        setRows(row);
        setColumns(column);
    };

    const handleClick = () => {
        onSelect(rows + 1, columns + 1, { borderColor, cellPadding });
    };

    return (
        <div className="table-popover" ref={ref}>
            <div className="table-grid">
                {[...Array(5)].map((_, rowIndex) => (
                    <div key={rowIndex} className="table-popover-row">
                        {[...Array(5)].map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className={`table-popover-cell ${rowIndex <= rows && colIndex <= columns ? "highlighted" : ""}`}
                                onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                                onClick={handleClick}
                                aria-label={`${rowIndex + 1}x${colIndex + 1}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="table-styles">
                <label>
                    Border Color:
                    <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
                </label>
                <label>
                    Cell Padding:
                    <input type="text" value={cellPadding} onChange={(e) => setCellPadding(e.target.value)} />
                </label>
            </div>
        </div>
    );
});

TablePopover.displayName = "TablePopover";

export { TablePopover };

