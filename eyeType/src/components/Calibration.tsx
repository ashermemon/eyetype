import { useEffect, useState, useRef } from "react";
import webgazer from "webgazer";
import CalibrationPoint from "./CalibrationPoint";

type Props = {
  onComplete: () => void;
};

export default function Calibration({ onComplete }: Props) {

  // Shuffle 
  const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const [points] = useState(() => {
    const center = [{ x: 50, y: 50, isEdge: false, isCenter: true }];
  
    const inner = [
      { x: 34, y: 34, isEdge: false, isCenter: false }, { x: 66, y: 34, isEdge: false, isCenter: false }, { x: 66, y: 66, isEdge: false, isCenter: false }, { x: 34, y: 66, isEdge: false, isCenter: false }
    ];
    
    const corners = [
      { x: 2, y: 2, isEdge: false, isCenter: false }, { x: 98, y: 2, isEdge: false, isCenter: false }, { x: 2, y: 98, isEdge: false, isCenter: false }, { x: 98, y: 98, isEdge: false, isCenter: false }
    ];
    
    // 8 edge points (2 on each border)
    const edges = [
      { x: 34, y: 2, isEdge: true, isCenter: false }, { x: 66, y: 2, isEdge: true, isCenter: false }, 
      { x: 34, y: 98, isEdge: true, isCenter: false }, { x: 66, y: 98, isEdge: true, isCenter: false }, 
      { x: 2, y: 34, isEdge: true, isCenter: false }, { x: 2, y: 66, isEdge: true, isCenter: false }, 
      { x: 98, y: 34, isEdge: true, isCenter: false }, { x: 98, y: 66, isEdge: true, isCenter: false }
    ];

    return [
      ...shuffle([...corners]),
      ...shuffle([...edges]),
      ...shuffle([...inner]),
      ...center 
    ];
  });

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
    webgazer.applyKalmanFilter(true);
    webgazer.begin();
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(true);
    webgazer.showPredictionPoints(false);
    webgazer.removeMouseEventListeners(); 
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
      setPointStatus(2);
      finishCalibration();
      return;
    }

    setCurrentIndex(index);
    setPointStatus(0);

    setTimeout(() => {
      setPointStatus(1);
      isRecording.current = true;
      
      const point = points[index];
      
      let recordX = point.x;
      let recordY = point.y;
      
      // helps reach corners
      if (point.x <= 5) recordX -= 2;
      if (point.x >= 95) recordX += 2;
      if (point.y <= 5) recordY -= 2;
      if (point.y >= 95) recordY += 2;

      const px = Math.round((recordX / 100) * window.innerWidth);
      const py = Math.round((recordY / 100) * window.innerHeight);


      
      let samples = 0;
      // center dot has more samples (6) vs edges (2) vs normal (3) 
      const targetSamples = point.isCenter ? 5 : point.isEdge ? 2 : 4; //5, 2, 4 // 5, 3, 3
       
      recordIntervalRef.current = window.setInterval(() => {
        if (samples >= targetSamples) { 
            return; 
        }
        webgazer.recordScreenPosition(px, py, "click");
        samples++;
      }, 100); // reecords every 100ms

      // dynamic duration based on samples
      const displayDuration = Math.max(1000, targetSamples * 100 + 400);

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

      }, displayDuration);

    }, 1200); 
  };

  const finishCalibration = () => {
    setCalibrating(false);
    webgazer.removeMouseEventListeners();
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
