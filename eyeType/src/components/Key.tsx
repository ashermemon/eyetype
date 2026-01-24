import React from "react";

type KeyProps = {
  label: string;
  active: boolean;
  width?: number; // for special keys like enter
  onSelect: () => void;
};

export default function Key({ label, active, width, onSelect }: KeyProps) {
  return (
    <button className={active ? "key key-active" : "key"} onClick={onSelect}>
      <text className="key-text">{label}</text>
    </button>
  );
}
