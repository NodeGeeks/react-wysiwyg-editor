import { Template } from "../ModernWysiwygEditor";

export interface TableStyles {
  borderColor: string;
  cellPadding: string;
}

export interface ToolbarProps {
  onFormat: (format: string, attributes?: Record<string, string>) => void;
  onTable: (rows: number, cols: number, styles: TableStyles) => void;
  onTemplate: (template: Template) => void;
  templates?: Template[];
  showTablePopover?: boolean;
  setShowTablePopover?: (show: boolean) => void;
}
