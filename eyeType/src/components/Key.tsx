import React from "react";

type KeyProps = {
  label: string;
  active: boolean;

  onSelect: () => void;
  row?: number;
  col?: number;
  nameKey?: boolean;
  highAlert?: boolean;
};

const Key = React.forwardRef<HTMLButtonElement, KeyProps>(
  (
    { label, active, onSelect, row, col, nameKey = false, highAlert = false },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`${nameKey ? `key name-key` : `key`} ${active && `key-active`}`}
        style={{
          backgroundColor: highAlert == true ? "#ffd6d6" : undefined,
          borderColor: highAlert == true ? "#D04C4C" : undefined,
        }}
        onClick={onSelect}
        data-row={row}
        data-col={col}
      >
        <span className="key-text">{label}</span>
      </button>
    );
  },
);

Key.displayName = "Key";

export default Key;
