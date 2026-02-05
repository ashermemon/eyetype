import { useEffect, useRef } from "react";
import webgazer from "webgazer";

type Props = {
  onGaze: (x: number, y: number) => void;
};

export default function EyeTracking({ onGaze }: Props) {
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useEffect(() => {
    webgazer
      .clearGazeListener()
      .setGazeListener((data: { x: number; y: number } | null) => {
        if (!data) return;

        if (!initialized.current) {
          pos.current = { x: data.x, y: data.y };
          initialized.current = true;
          onGaze(data.x, data.y);
          return;
        }

        const stiffness = 0.12; 
        const damping = 0.75;   
        const dx = data.x - pos.current.x;
        const dy = data.y - pos.current.y;

        vel.current.x = vel.current.x * damping + dx * stiffness;
        vel.current.y = vel.current.y * damping + dy * stiffness;

        pos.current.x += vel.current.x;
        pos.current.y += vel.current.y;

        // don't go off screen
        pos.current.x = Math.max(0, Math.min(window.innerWidth, pos.current.x));
        pos.current.y = Math.max(0, Math.min(window.innerHeight, pos.current.y));

        onGaze(pos.current.x, pos.current.y);
      });

    return () => {
      webgazer.clearGazeListener();
    };
  }, [onGaze]);

  return null;
}
