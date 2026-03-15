import { useEffect, useRef } from "react";
import webgazer from "webgazer";
import {OneEuroFilter} from '1eurofilter'


type Props = {
  onGaze: (x: number, y: number) => void;
};

export default function EyeTracking({ onGaze }: Props) {
  const initialized = useRef(false);

  let frequency = 120; 
  let mincutoff = 1.0;
  let beta = 0.1;      
  let dcutoff = 1.0; 

  const filterX = useRef(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));
  const filterY = useRef(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));


  const lastPos = useRef({ x: 0, y: 0 });
  const MAX_VELOCITY = 1000; 

  // const median = (arr: number[]) => {
  //   const sorted = [...arr].sort((a, b) => a - b);
  //   return sorted[Math.floor(sorted.length / 2)];
  // };

  useEffect(() => {
    webgazer
      .clearGazeListener()
      .setGazeListener((data: { x: number; y: number } | null) => {
        if (!data) return;

        const timestamp = Date.now() / 1000; 

        // // 1. Median Filter (Size 5) to strip spikes
        // bufferX.current.push(data.x);
        // bufferY.current.push(data.y);
        // if (bufferX.current.length > BUFFER_SIZE) bufferX.current.shift();
        // if (bufferY.current.length > BUFFER_SIZE) bufferY.current.shift();

        // if (bufferX.current.length < BUFFER_SIZE) return;

        // const medianX = median(bufferX.current);
        // const medianY = median(bufferY.current);

        // 2. Velocity Cap to prevent teleporting
        let targetX = data.x;
        let targetY = data.y;

        if (initialized.current) {
          const dx = data.x - lastPos.current.x;
          const dy = data.y - lastPos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > MAX_VELOCITY) {
            const ratio = MAX_VELOCITY / dist;
            targetX = lastPos.current.x + dx * ratio;
            targetY = lastPos.current.y + dy * ratio;
          }
        }

        // 3. One Euro Filter for adaptive smoothing
        const smoothedX = filterX.current.filter(targetX, timestamp);
        const smoothedY = filterY.current.filter(targetY, timestamp);

        // 4. Bounds check
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

  return null;
}
