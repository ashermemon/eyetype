import React, { useState } from "react";

type Props = {};

export default function Calibration({}: Props) {
  const points = [
    { x: 40, y: 10 },
    { x: 50, y: 10 },
    { x: 90, y: 10 },
    { x: 10, y: 50 },
    { x: 50, y: 50 },
    { x: 90, y: 50 },
    { x: 10, y: 90 },
    { x: 50, y: 90 },
    { x: 90, y: 90 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const point = points[currentIndex];

  return (
    <div className="calibration-container">
      <div
        className="calibration-point"
        style={{
          right: point.x + "%",
          top: point.y + "%",
        }}
      />
    </div>
  );
}
