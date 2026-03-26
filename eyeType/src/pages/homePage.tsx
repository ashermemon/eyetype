import React, { useState, useCallback, useRef } from "react";
import KeyGrid from "../components/KeyGrid";
import EyeTracking from "../components/EyeTracking";
import Calibration from "../components/Calibration";
import PrimaryUI from "../components/PrimaryUI";

type Props = {};

export default function HomePage({}: Props) {
  const [gaze, setGaze] = useState<{ x: number; y: number } | null>(null);
  const [activeKey, setActiveKey] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const [calibrated, setCalibrated] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const lastStateUpdate = useRef<number>(0);

  // physics stuff
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const velocity = useRef({ x: 0, y: 0 });

  const handleGaze = useCallback((x: number, y: number) => {
    // update target position
    targetPos.current = { x, y };
  }, []);

  const handleHighlight = useCallback((row: number, col: number) => {
    setActiveKey({ row, col });
  }, []);


  const stiffness = 0.1;
  const friction = 0.45;

  React.useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      // calculate spring force based on distance to target
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      // accelerate towards target
      velocity.current.x += dx * stiffness;
      velocity.current.y += dy * stiffness;
      
      // apply friction
      velocity.current.x *= friction;
      velocity.current.y *= friction;

      // update actual position
      currentPos.current.x += velocity.current.x;
      currentPos.current.y += velocity.current.y;

      // prevent reversing / rebound
      if ((dx > 0 && currentPos.current.x >= targetPos.current.x) || 
          (dx < 0 && currentPos.current.x <= targetPos.current.x)) {
        currentPos.current.x = targetPos.current.x;
        velocity.current.x = 0;
      }
      if ((dy > 0 && currentPos.current.y >= targetPos.current.y) || 
          (dy < 0 && currentPos.current.y <= targetPos.current.y)) {
        currentPos.current.y = targetPos.current.y;
        velocity.current.y = 0;
      }

      // draw dot
      if (dotRef.current) {
        dotRef.current.style.left = `${currentPos.current.x}px`;
        dotRef.current.style.top = `${currentPos.current.y}px`;
        dotRef.current.style.display = "block";
      }


      const now = Date.now();
      if (now - lastStateUpdate.current > 32) { 
        setGaze({ x: currentPos.current.x, y: currentPos.current.y });
        lastStateUpdate.current = now;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);


  return (
    <div className="fill-page">
      <EyeTracking onGaze={handleGaze} />
      <Calibration onComplete={() => setCalibrated(true)} />
      
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "12px",
          height: "12px",
          backgroundColor: "#ff4d4d",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 2147483647, 
          boxShadow: "0 0 12px rgba(255, 77, 77, 0.6)",
          //4transition: "left 0.08s ease-out, top 0.08s ease-out",
          display: "none", 
        }}
      />
      
      {calibrated && (
        <PrimaryUI 
          activeKey={activeKey} 
          gazeData={gaze} 
          onHighlight={handleHighlight} 
        />
      )}

    </div>
  );
}
