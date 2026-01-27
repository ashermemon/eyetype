import React, { useState } from "react";
import KeyGrid from "../components/KeyGrid";
import EyeTracking from "../components/EyeTracking";
import Calibration from "../components/Calibration";

type Props = {};

export default function KeyboardPage({}: Props) {
  const [calibrated, setCalibrated] = useState(false);
  const handleTracking = (x: number, y: number) => {
    console.log(x, y);
  };

  return (
    <div className="fill-page">
      <EyeTracking onGaze={handleTracking} />
      <Calibration onComplete={() => setCalibrated(true)} />
      {calibrated ? <KeyGrid /> : null}
    </div>
  );
}
