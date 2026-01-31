import React, { useState, useEffect } from "react";

type Point = {
  x: number;
  y: number;
};

type Props = {
  point: Point;
};

export default function CalibrationPoint({ point }: Props) {
  const [count, setCount] = useState(0);
  const [green, setGreen] = useState(false);

  useEffect(() => {
    setCount(0);
    setGreen(false);
  }, [point.x, point.y]);
  return (
    <button
      onClick={() => {
        if (count < 5) {
          setCount(count + 1);
        } else if (count == 5) {
          setGreen(true);
        }
      }}
      className="calibration-point"
      style={{
        left: point.x + "%",
        top: point.y + "%",

        borderWidth: green ? 0 : undefined,
        backgroundColor: green
          ? "#65e094"
          : `rgb(255, ${235 - count * 20}, ${235 - count * 20})`,
      }}
    />
  );
}
