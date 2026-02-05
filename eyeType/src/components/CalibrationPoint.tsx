import { useEffect, useState } from "react";

type Point = {
  x: number;
  y: number;
};



type Props = {
  point: Point;
  status: number;
};

export default function CalibrationPoint({ point, status }: Props) {
  // yellow: about to record (0)
  // red: recording position (1)
  // green: done (2)

  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    if (status === 1) {
        const interval = setInterval(() => {
            setOpacity(opacity => opacity === 1 ? 0.5 : 1);
        }, 500);
        return () => clearInterval(interval);
    } else {
        setOpacity(1);
    }
  }, [status]);

  let backgroundColor = "gray";
  if (status === 0) backgroundColor = "#facc15"; 
  if (status === 1) backgroundColor = "#ef4444"; 
  if (status === 2) backgroundColor = "#22c55e"; 

  return (
    <div
      className="calibration-point"
      style={{
        opacity: opacity,
        backgroundColor: backgroundColor,
        left: point.x + "%",
        top: point.y + "%",
        transition: "background-color 0.3s, opacity 0.3s"

      }}
    />
  );
}
