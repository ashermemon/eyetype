import { useEffect, useRef } from "react";
import webgazer from "webgazer";
import { OneEuroFilter } from "../utils/OneEuroFilter";

type Props = {
  onGaze: (x: number, y: number) => void;
};

export default function EyeTracking({ onGaze }: Props) {
  const initialized = useRef(false);
  // One Euro Filter instances for X and Y - Aggressive tuning for stability
  const filterX = useRef(new OneEuroFilter(60, 0.5, 0.001, 1.0));
  const filterY = useRef(new OneEuroFilter(60, 0.5, 0.001, 1.0));

  // Median filter buffer (Size 5 for better outlier rejection)
  const bufferX = useRef<number[]>([]);
  const bufferY = useRef<number[]>([]);
  const BUFFER_SIZE = 5;

  const lastPos = useRef({ x: 0, y: 0 });
  const MAX_VELOCITY = 1000; // Pixels per update cap (Faster for responsiveness)

  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  useEffect(() => {
    webgazer
      .clearGazeListener()
      .setGazeListener((data: { x: number; y: number } | null) => {
        if (!data) return;

        const timestamp = Date.now();

        // 1. Median Filter (Size 5) to strip spikes
        bufferX.current.push(data.x);
        bufferY.current.push(data.y);
        if (bufferX.current.length > BUFFER_SIZE) bufferX.current.shift();
        if (bufferY.current.length > BUFFER_SIZE) bufferY.current.shift();

        if (bufferX.current.length < BUFFER_SIZE) return;

        const medianX = median(bufferX.current);
        const medianY = median(bufferY.current);

        // 2. Velocity Cap to prevent teleporting
        let targetX = medianX;
        let targetY = medianY;

        if (initialized.current) {
          const dx = medianX - lastPos.current.x;
          const dy = medianY - lastPos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > MAX_VELOCITY) {
            const ratio = MAX_VELOCITY / dist;
            targetX = lastPos.current.x + dx * ratio;
            targetY = lastPos.current.y + dy * ratio;
          }
        }

        // 3. One Euro Filter for adaptive smoothing
        const smoothedX = filterX.current.filter(targetX, timestamp);
        const smoothedY = filterY.current.filter(targetY, timestamp);

        // 4. Bounds check
        const boundedX = Math.max(0, Math.min(window.innerWidth, smoothedX));
        const boundedY = Math.max(0, Math.min(window.innerHeight, smoothedY));

        lastPos.current = { x: boundedX, y: boundedY };
        initialized.current = true;
        onGaze(boundedX, boundedY);
      });

    return () => {
      webgazer.clearGazeListener();
    };
  }, [onGaze]);

  return null;
}
