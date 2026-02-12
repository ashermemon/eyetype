import { useState, useCallback, useRef } from "react";
import EyeTracking from "../components/EyeTracking";
import Calibration from "../components/Calibration";
import HighlightKey from "../components/HighlightKey";
import PrimaryUI from "../components/PrimaryUI";

type Props = {};

export default function HomePage({}: Props) {
  const [gaze, setGaze] = useState<{ x: number; y: number } | null>(null);
  const [activeKey, setActiveKey] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const [calibrated, setCalibrated] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const lastStateUpdate = useRef<number>(0);

  const handleGaze = useCallback((x: number, y: number) => {
    // 1. Direct DOM update for the dot (high frequency, buttery smooth)
    if (dotRef.current) {
      dotRef.current.style.left = `${x}px`;
      dotRef.current.style.top = `${y}px`;
      dotRef.current.style.display = "block";
    }

    // 2. Throttled state update for highlighting logic (lower frequency)
    const now = Date.now();
    if (now - lastStateUpdate.current > 32) { // ~30Hz is plenty for highlighting
      setGaze({ x, y });
      lastStateUpdate.current = now;
    }
  }, []);

  const handleHighlight = useCallback((row: number, col: number) => {
    setActiveKey({ row, col });
  }, []);

  return (
    <div className="fill-page">
      <HighlightKey
        gazeData={gaze}
        onHighlight={handleHighlight}
      />

      <EyeTracking onGaze={handleGaze} />
      <Calibration onComplete={() => setCalibrated(true)} />
      
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "8px",
          height: "8px",
          backgroundColor: "#ff0000",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999, 
          boxShadow: "0 0 8px rgba(255, 0, 0, 0.8)",
          display: "none", // Hide until first gaze data
        }}
      />
      
      {calibrated && <PrimaryUI activeKey={activeKey} />}
    </div>
  );
}
