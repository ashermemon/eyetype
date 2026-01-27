import React, { useEffect, useRef } from "react";

type Props = {
  gazeData: { x: number; y: number } | null;
  onHighlight: (row: number, col: number) => void;
};

function onHighlight(row: number, column: number) {}

export default function HighlightKey({ gazeData, onHighlight }: Props) {
  useEffect(() => {
    if (!gazeData) {
      return;
    }

    let closest = {
      row: -1,
      column: -1,
      distance: Infinity,
    };

    document.querySelectorAll(".key").forEach((key) => {
      const rect = key.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = gazeData.x - centerX;
      const distanceY = gazeData.y - centerY;
      const distance = distanceX * distanceX + distanceY * distanceY;

      if (distance < closest.distance) {
        closest = {
          row: Number(key.getAttribute("data-row")),
          column: Number(key.getAttribute("data-col")),
          distance: distance,
        };
      }
    });

    if (closest.row === -1) return;

    if (
      !lastHighlighted.current ||
      lastHighlighted.current.row !== closest.row ||
      lastHighlighted.current.column !== closest.column
    ) {
      lastHighlighted.current = {
        row: closest.row,
        column: closest.column,
      };
      onHighlight(closest.row, closest.column);
    }
  }, [gazeData, onHighlight]);

  const lastHighlighted = useRef<{
    row: number;
    column: number;
  } | null>(null);
  return null;
}
