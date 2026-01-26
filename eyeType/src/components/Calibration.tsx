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

  const timeDelay = 500; //3000
  const dotDelay = 500; //3000

  useEffect(() => {
    webgazer.showVideo(false);

    setTimeout(() => setDisplayText("Look at the dot to calibrate"), timeDelay);
    setTimeout(
      () => setDisplayText("It will move every 3 seconds"),
      2 * timeDelay,
    );
    setTimeout(
      () =>
        setDisplayText(
          "Do not move your head or resize the window during or after calibration",
        ),
      3 * timeDelay,
    );
    setTimeout(
      () => (
        setDisplayText("Center your head within the box to begin"),
        webgazer.showVideo(true)
      ),
      4 * timeDelay,
    );
    const calibrationSequence = setTimeout(() => {
      setDisplayText("");
      setCalibrating(true);
      const interval = setInterval(() => {
        setCurrentIndex((index) => {
          if (index + 1 >= points.length) {
            clearInterval(interval);
            setDisplayText("Calibration complete!");
            setCalibrating(false);
            webgazer.showVideo(false);

            onComplete();
            return index;
          }
          return index + 1;
        });
      }, dotDelay);

      return () => clearInterval(interval);
    }, 5 * timeDelay);
  }, [onComplete]);

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
