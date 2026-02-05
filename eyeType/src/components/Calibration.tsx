import { useEffect, useState, useRef } from "react";
import webgazer from "webgazer";
import CalibrationPoint from "./CalibrationPoint";

type Props = {
  onComplete: () => void;
};

export default function Calibration({ onComplete }: Props) {

  const [points] = useState([


    { x: 50, y: 50 }, // center


    { x: 34, y: 34 }, { x: 66, y: 34 }, { x: 66, y: 66 }, { x: 34, y: 66 }, // inner

 
    { x: 2, y: 2 }, { x: 98, y: 2 }, { x: 2, y: 98 }, { x: 98, y: 98 }, // corners
    
    { x: 34, y: 2 }, { x: 66, y: 2 }, // top
    { x: 98, y: 34 }, { x: 98, y: 66 }, // right
    { x: 66, y: 98 }, { x: 34, y: 98 }, // bottom
    { x: 2, y: 66 }, { x: 2, y: 34 },   // left
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("Calibrating eye tracker...");
  const [calibrating, setCalibrating] = useState(false);
  const [pointStatus, setPointStatus] = useState(0);

  const timeDelay = 3000;
  const isRecording = useRef(false);

  useEffect(() => {
    webgazer.clearData();
    webgazer.setRegression("ridge");
    webgazer.setTracker("TFFacemesh");
    webgazer.saveDataAcrossSessions(false);
    webgazer.removeMouseEventListeners();
    webgazer.applyKalmanFilter(false);
    webgazer.begin();
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(true);
    webgazer.showPredictionPoints(false); 
  }, []);


  useEffect(() => {
    const timers: number[] = [];


    timers.push(
      window.setTimeout(
        () => setDisplayText("Look at the dot to calibrate"),
        timeDelay
      ),
      window.setTimeout(
        () => setDisplayText("It will turn red when recording"),
        2 * timeDelay
      ),
      window.setTimeout(
        () =>
          setDisplayText(
            "Do not move your head, follow the dot with your eyes"
          ),
        3 * timeDelay
      ),
      window.setTimeout(() => {
        setDisplayText("Center your head within the box to begin");
        webgazer.showVideo(true);
      }, 4 * timeDelay)
    );

    const startCalibration = window.setTimeout(() => {
      setDisplayText("");
      setCalibrating(true);
      runCalibrationStep(0);
    }, 5 * timeDelay);

    timers.push(startCalibration);

    return () => {
      timers.forEach(clearTimeout);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);

  const recordIntervalRef = useRef<number | null>(null);

  const runCalibrationStep = (index: number) => {
    if (index >= points.length) {
      finishCalibration();
      return;
    }

    setCurrentIndex(index);
    setPointStatus(0);

    setTimeout(() => {
      setPointStatus(1);
      isRecording.current = true;
      
      const point = points[index];
      const px = Math.round((point.x / 100) * window.innerWidth);
      const py = Math.round((point.y / 100) * window.innerHeight);


      
      let samples = 0;
      recordIntervalRef.current = window.setInterval(() => {
        if (samples >= 3) { // max 3 samples per point
            return; 
        }
        webgazer.recordScreenPosition(px, py, "click");
        samples++;
      }, 50);

      setTimeout(() => {
        if (recordIntervalRef.current) {
            clearInterval(recordIntervalRef.current);
            recordIntervalRef.current = null;
        }
        isRecording.current = false;
        setPointStatus(2);

        setTimeout(() => {
            runCalibrationStep(index + 1);
        }, 500); 

      }, 600); 

    }, 1200); 
  };

  const finishCalibration = () => {
    setCalibrating(false);
    webgazer.showVideo(false);
    setDisplayText("Calibration complete!");
    setTimeout(() => {
        setDisplayText("");
        onComplete();
    }, 2000);
  };

  return (
    <div className="calibration-container">
      {calibrating ? (
        <CalibrationPoint point={points[currentIndex]} status={pointStatus} />
      ) : (
        <h2 className="calibration-text">{displayText}</h2>
      )}
    </div>
  );
}
