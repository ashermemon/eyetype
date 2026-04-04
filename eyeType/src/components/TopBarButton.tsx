import React from "react";

type Props = {
  color: string;
  textColor: string;
  label: string;
  onClick: () => void;
  highlightColor?: string;
  subtext?: string;
};

export default function TopBarButton({
  color,
  textColor,
  label,
  onClick,
  subtext,
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
      {subtext &&
      <p className="button-text" style={{ color: textColor, fontSize: "2vh", margin: 5, }}>
        {subtext}
      </p>}
      
    </button>
  );
}
