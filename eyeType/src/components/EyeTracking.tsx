import { useEffect } from "react";
import webgazer from "webgazer";

type Props = {
  onGaze: (x: number, y: number) => void;
};

export default function EyeTracking({ onGaze }: Props) {
  useEffect(() => {
    //webgazer.removeMouseEventListeners();
    webgazer.clearGazeListener().setGazeListener(function (data: {
      x: number;
      y: number;
    }) {
      if (data == null) {
        return;
      }
      onGaze(data.x, data.y);
    });

    return () => {
      //webgazer.clearGazeListener();
      //webgazer.end();
    };
  }, [onGaze]);

  return null;
}
