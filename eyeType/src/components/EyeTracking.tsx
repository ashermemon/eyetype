import React, { useEffect } from "react";
import webgazer from "webgazer";

type Props = {
  onGaze: (x: number, y: number) => void;
};

export default function EyeTracking({ onGaze }: Props) {
  useEffect(() => {
    webgazer
      .setRegression("ridge")

      .clearGazeListener()
      .setGazeListener(function (data: { x: number; y: number }) {
        if (data == null) {
          return;
        }
        onGaze(data.x, data.y);
      })
      .begin();
    webgazer.removeMouseEventListeners();

    webgazer.showVideo(true);
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);

    return () => {
      webgazer.clearGazeListener();
      webgazer.end();
    };
  }, [onGaze]);

  return null;
}
