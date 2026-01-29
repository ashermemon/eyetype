import React from "react";

type Props = {
  color: string;
  textColor: string;
  label: string;
  onClick: () => void;
};

export default function TopBarButton({
  color,
  textColor,
  label,
  onClick,
}: Props) {
  return (
    <button
      className="top-bar-button"
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      <p className="button-text" style={{ color: textColor }}>
        {label}
      </p>
    </button>
  );
}
