import React from "react";

type KeyProps = {
  label: string;
  active: boolean;
  onSelect: () => void;
  row?: number;
  col?: number;
  nameKey?: boolean;
};

const Key = React.forwardRef<HTMLButtonElement, KeyProps>(
  ({ label, active, onSelect, row, col, nameKey = false }, ref) => {
    return (
      <button
        ref={ref}
        className={`${nameKey ? `name-key` : `key`} ${active && `key-active`}`}
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
