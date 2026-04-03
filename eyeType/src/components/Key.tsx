import React from "react";

type KeyProps = {
  label: string;
  subLabel?: string;
  active: boolean;

  onSelect: () => void;
  row?: number;
  col?: number;
  nameKey?: boolean;
  highAlert?: boolean;
  isSpaceKey?: boolean;
};

const Key = React.forwardRef<HTMLButtonElement, KeyProps>(
  (
    { label, subLabel, active, onSelect, row, col, nameKey = false, highAlert = false, isSpaceKey = false },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`${nameKey ? "key name-key" : "key"} ${active ? "key-active" : ""}`}
        style={{
          backgroundColor: highAlert == true ? "#ffd6d6" :  undefined,
          borderColor: highAlert == true ? "#D04C4C" : undefined,
          gridColumn: isSpaceKey ? "span 2" : undefined,
          aspectRatio: isSpaceKey ? "auto" : undefined,
          display: "flex", // Ensure flex for centering both labels
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: subLabel ? "4px" : undefined
        }}
        onClick={onSelect}
        data-row={row}
        data-col={col}
      >
        <span className="key-text" style={{ fontSize: subLabel ? "2.5vw" : undefined }}>{label}</span>
        {subLabel && <span className="key-sub-text" style={{ color: highAlert ? "#D04C4C" : undefined }}>{subLabel}</span>}
      </button>
    );
  },
);

Key.displayName = "Key";

export default Key;
