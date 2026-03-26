import { useEffect, useRef } from "react";
import webgazer from "webgazer";
import { OneEuroFilter } from "1eurofilter";

type Props = {
  onGaze: (x: number, y: number) => void;
};

export default function EyeTracking({ onGaze }: Props) {
  // one euro filter parameters
  const frequency = 30;
  const mincutoff = 0.001;
  const beta = 0.0007;
  const dcutoff = 1.0;

  const filterX = useRef(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));
  const filterY = useRef(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));

  useEffect(() => {
    webgazer
      .clearGazeListener()
      .setGazeListener((data: { x: number; y: number } | null) => {
        if (!data) return;

        const timestamp = Date.now() / 1000; 

        // one euro filter
        const smoothedX = filterX.current.filter(data.x, timestamp);
        const smoothedY = filterY.current.filter(data.y, timestamp);

        // bounds check
        const boundedX = Math.max(0, Math.min(window.innerWidth, smoothedX));
        const boundedY = Math.max(0, Math.min(window.innerHeight, smoothedY));

        onGaze(boundedX, boundedY);
      });

    return () => {
      webgazer.clearGazeListener();
    };
  }, [onGaze]);


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
      Version 1.40 (Keyboard Sections)
      </button>
    );
}
