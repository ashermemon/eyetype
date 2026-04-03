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
<></>
    );
}
