import React from "react";

interface DebugPanelProps {
  selectionState: {
    isCollapsed: boolean;
    start: number;
    end: number;
    length: number;
  } | null;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ selectionState }) => {
  return (
    <div className="debug-panel" style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "10px",
      borderRadius: "5px",
      fontFamily: "monospace",
      zIndex: 1000,
    }}>
      <h3 style={{ margin: "0 0 8px 0" }}>Selection Debug Info</h3>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "4px" }}>
        <div>Is Collapsed:</div>
        <div>{selectionState?.isCollapsed?.toString() ?? "N/A"}</div>
        <div>Start Position:</div>
        <div>{selectionState?.start ?? "N/A"}</div>
        <div>End Position:</div>
        <div>{selectionState?.end ?? "N/A"}</div>
        <div>Selection Length:</div>
        <div>{selectionState?.length ?? "N/A"}</div>
      </div>
    </div>
  );
};