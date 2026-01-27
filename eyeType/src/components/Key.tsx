import React from "react";

type KeyProps = {
  label: string;
  active: boolean;
  onSelect: () => void;
  row?: number;
  col?: number;
};

const Key = React.forwardRef<HTMLButtonElement, KeyProps>(
  ({ label, active, onSelect, row, col }, ref) => {
    return (
      <button
        ref={ref}
        className={active ? "key key-active" : "key"}
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
