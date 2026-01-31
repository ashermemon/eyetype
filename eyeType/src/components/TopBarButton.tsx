import React from "react";

type Props = {
  color: string;
  textColor: string;
  label: string;
  onClick: () => void;
  highlightColor?: string;
};

export default function TopBarButton({
  color,
  textColor,
  label,
  onClick,
  highlightColor = "#ca9335",
}: Props) {
  return (
    <button
      className="top-bar-button"
      highlight-color={highlightColor}
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      <p className="button-text" style={{ color: textColor }}>
        {label}
      </p>
    </button>
  );
}
