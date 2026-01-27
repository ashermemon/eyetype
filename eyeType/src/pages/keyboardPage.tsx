import React, { useState } from "react";
import KeyGrid from "../components/KeyGrid";
import EyeTracking from "../components/EyeTracking";
import Calibration from "../components/Calibration";
import HighlightKey from "../components/HighlightKey";

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
      {calibrated && <KeyGrid activeKey={activeKey} />}
    </div>
  );
}
