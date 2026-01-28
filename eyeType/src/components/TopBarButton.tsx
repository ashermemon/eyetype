import React from "react";

type Props = {
  color: string;
  textColor: string;
  label: string;
};

export default function TopBarButton({ color, textColor, label }: Props) {
  return (
    <button className="top-bar-button" style={{ backgroundColor: color }}>
      <p className="button-text" style={{ color: textColor }}>
        {label}
      </p>
    </button>
  );
}
