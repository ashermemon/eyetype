import { useEffect, useRef, useState } from "react";
import webgazer from "webgazer";
import { OneEuroFilter } from "1eurofilter";

type Props = {
  onGaze: (x: number, y: number) => void;
};

export default function EyeTracking({ onGaze }: Props) {
  const initialized = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const MAX_VELOCITY = 180; // 500?

  // Median filter buffer (Size 5 for better outlier rejection)
  const bufferX = useRef<number[]>([]);
  const bufferY = useRef<number[]>([]);
  const BUFFER_SIZE = 5;

  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  // Filter params — stored as state for slider UI, and as refs for use inside the gaze listener
  const [frequency, setFrequency] = useState(30);
  const [mincutoff, setMinCutoff] = useState(0.001);
  const [beta, setBeta] = useState(0.0007);
  const [dcutoff, setDCutoff] = useState(1.0);
  // Refs so the gaze listener closure always sees the latest values
  const frequencyRef = useRef(frequency);
  const mincutoffRef = useRef(mincutoff);
  const betaRef = useRef(beta);
  const dcutoffRef = useRef(dcutoff);

  // Recreate filters whenever params change
  const filterX = useRef(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));
  const filterY = useRef(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));

  useEffect(() => {
    frequencyRef.current = frequency;
    mincutoffRef.current = mincutoff;
    betaRef.current = beta;
    dcutoffRef.current = dcutoff;
    filterX.current = new OneEuroFilter(frequency, mincutoff, beta, dcutoff);
    filterY.current = new OneEuroFilter(frequency, mincutoff, beta, dcutoff);
    initialized.current = false; // reset velocity tracking after filter change
  }, [frequency, mincutoff, beta, dcutoff]);

  useEffect(() => {
    webgazer
      .clearGazeListener()
      .setGazeListener((data: { x: number; y: number } | null) => {
        if (!data) return;

        const timestamp = Date.now() / 1000; 

        // 1. Median Filter (Size 5) to strip spikes
        bufferX.current.push(data.x);
        bufferY.current.push(data.y);
        if (bufferX.current.length > BUFFER_SIZE) bufferX.current.shift();
        if (bufferY.current.length > BUFFER_SIZE) bufferY.current.shift();

        if (bufferX.current.length < BUFFER_SIZE) return;

        const medianX = median(bufferX.current);
        const medianY = median(bufferY.current);

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

        // One Euro Filter
        const smoothedX = filterX.current.filter(targetX, timestamp);
        const smoothedY = filterY.current.filter(targetY, timestamp);

        // Bounds check
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

  const sliderStyle: React.CSSProperties = {
    width: "100%",
    accentColor: "#6EC0FF",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 10,
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#ccc",
    fontFamily: "monospace",
  };


    return (
      <button
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 99999,
          background: "#2a2a2e",
          color: "#6EC0FF",
          border: "1px solid #6EC0FF",
          borderRadius: 8,
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "monospace",
        }}
      >
      Version 1.1 (One Euro Filter)
      </button>
    );
}
