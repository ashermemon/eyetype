import { useEffect, useState } from "react";
import webgazer from "webgazer";

type Props = {
  onComplete: () => void;
};

export default function Calibration({ onComplete }: Props) {
  const points = [
    { x: 10, y: 10 },
    { x: 50, y: 10 },
    { x: 90, y: 10 },
    { x: 10, y: 50 },
    { x: 50, y: 50 },
    { x: 90, y: 50 },
    { x: 10, y: 90 },
    { x: 50, y: 90 },
    { x: 90, y: 90 },
    { x: 50, y: 50 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("Calibrating eye tracker...");
  const [calibrating, setCalibrating] = useState(false);

  const timeDelay = 3000;
  const dotDelay = 3000;

  useEffect(() => {
    webgazer.clearData();
    webgazer.setRegression("weightedRidge");
    //webgazer.setTracker("trackingjs");
    webgazer.showPredictionPoints(true);
    webgazer.removeMouseEventListeners();

    webgazer.begin();
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(true);
    webgazer.showPredictionPoints(true);
  }, []);
  useEffect(() => {
    const timers: number[] = [];

    timers.push(
      window.setTimeout(
        () => setDisplayText("Look at the dot to calibrate"),
        timeDelay,
      ),
      window.setTimeout(
        () => setDisplayText("It will move every 3 seconds"),
        2 * timeDelay,
      ),
      window.setTimeout(
        () =>
          setDisplayText(
            "Do not move your head or resize the window during or after calibration",
          ),
        3 * timeDelay,
      ),
      window.setTimeout(() => {
        setDisplayText("Center your head within the box to begin");
        webgazer.showVideo(true);
      }, 4 * timeDelay),
    );

    const calibrationSequence = window.setTimeout(() => {
      setDisplayText("");
      setCalibrating(true);

      const recordInterval = window.setInterval(() => {
        const point = points[currentIndex];
        if (!point) return;

        const px = (point.x / 100) * window.innerWidth;
        const py = (point.y / 100) * window.innerHeight;
        webgazer.recordScreenPosition(px, py, "calibration");
      }, 50);

      const interval = window.setInterval(() => {
        setCurrentIndex((index) => {
          if (index + 1 >= points.length) {
            clearInterval(interval);
            clearInterval(recordInterval);
            setDisplayText("Calibration complete!");
            setCalibrating(false);
            webgazer.showVideo(false);
            setTimeout(() => [setDisplayText(""), onComplete()], 4000);
            return index;
          }
          return index + 1;
        });
      }, dotDelay);
    }, 5 * timeDelay);

    timers.push(calibrationSequence);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="calibration-container">
      {calibrating ? (
        <div
          className="calibration-point"
          style={{
            left: points[currentIndex].x + "%",
            top: points[currentIndex].y + "%",
          }}
        />
      ) : (
        <h2 className="calibration-text">{displayText}</h2>
      )}
    </div>
  );
}
