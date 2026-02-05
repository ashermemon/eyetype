import React, { useState } from "react";
import KeyGrid from "../components/KeyGrid";
import EyeTracking from "../components/EyeTracking";
import Calibration from "../components/Calibration";
import HighlightKey from "../components/HighlightKey";
import PrimaryUI from "../components/PrimaryUI";

type Props = {};

export default function KeyboardPage({}: Props) {
  const [gaze, setGaze] = useState<{ x: number; y: number } | null>(null);
  const [activeKey, setActiveKey] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const [calibrated, setCalibrated] = useState(false);
  const handleTracking = (x: number, y: number) => {
    //console.log(x, y);
  };

  return (
    <div className="fill-page">
      <HighlightKey
        gazeData={gaze}
        onHighlight={(row, col) => {
          setActiveKey({ row, col });
        }}
      />

      <EyeTracking onGaze={(x, y) => setGaze({ x, y })} />
      <Calibration onComplete={() => setCalibrated(true)} />
      {gaze && (
        <div
          style={{
            position: "fixed",
            left: gaze.x,
            top: gaze.y,
            width: "10px",
            height: "10px",
            backgroundColor: "red",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 9999, 
            boxShadow: "0 0 10px rgba(255, 0, 0, 0.5)",
          }}
        />
      )}
      {calibrated && <PrimaryUI activeKey={activeKey} />}
    </div>
  );
}
