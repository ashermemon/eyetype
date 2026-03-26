import React, { useState, useCallback, useRef } from "react";
import KeyGrid from "../components/KeyGrid";
import EyeTracking from "../components/EyeTracking";
import Calibration from "../components/Calibration";
import HighlightKey from "../components/HighlightKey";
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

  const [stiffness, setStiffness] = useState(0.1);
  const [friction, setFriction] = useState(0.45);
  const [showPhysicsPanel, setShowPhysicsPanel] = useState(true);

  const stiffnessRef = useRef(stiffness);
  const frictionRef = useRef(friction);

  React.useEffect(() => {
    stiffnessRef.current = stiffness;
    frictionRef.current = friction;
  }, [stiffness, friction]);

  // spring physics animation loop
  React.useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      // calculate spring force based on distance to target
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      // accelerate towards target
      velocity.current.x += dx * stiffnessRef.current;
      velocity.current.y += dy * stiffnessRef.current;
      
      // apply friction
      velocity.current.x *= frictionRef.current;
      velocity.current.y *= frictionRef.current;

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

  const sliderStyle: React.CSSProperties = {
    width: "100%",
    accentColor: "#ff4d4d",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 10,
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#ccc",
    fontFamily: "monospace",
  };

  return (
    <div className="fill-page">
      <HighlightKey
        gazeData={gaze}
        onHighlight={handleHighlight}
      />

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
      
      {calibrated && <PrimaryUI activeKey={activeKey} />}

      {!showPhysicsPanel ? (
        <button
          onClick={() => setShowPhysicsPanel(true)}
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 99999,
            background: "#2a2a2e",
            color: "#ff4d4d",
            border: "1px solid #ff4d4d",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "monospace",
          }}
        >
          Physics Tuner ⚙
        </button>
      ) : (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 99999,
            background: "#1e1e22",
            border: "1px solid #ff4d4d44",
            borderRadius: 12,
            padding: "14px 16px",
            width: 260,
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            fontFamily: "monospace",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "#ff4d4d", fontWeight: "bold", fontSize: 13 }}>Physics Tuner (Dot)</span>
            <button
              onClick={() => setShowPhysicsPanel(false)}
              style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
            >✕</button>
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>
              <span>Stiffness (Snap)</span>
              <span>{stiffness.toFixed(3)}</span>
            </div>
            <input type="range" min={0.001} max={0.3} step={0.001} value={stiffness}
              onChange={e => setStiffness(Number(e.target.value))} style={sliderStyle} />
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>
              <span>Friction (Drag)</span>
              <span>{friction.toFixed(3)}</span>
            </div>
            <input type="range" min={0.1} max={0.99} step={0.01} value={friction}
              onChange={e => setFriction(Number(e.target.value))} style={sliderStyle} />
          </div>

          <div style={{ marginTop: 6, fontSize: 10, color: "#666", textAlign: "center" }}>
            ↑ Stiffness = snaps faster&nbsp;&nbsp;|&nbsp;&nbsp;↑ Friction = sluggish
          </div>
        </div>
      )}
    </div>
  );
}
