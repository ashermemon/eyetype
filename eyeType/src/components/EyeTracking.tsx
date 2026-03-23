import { useEffect, useRef, useState } from "react";
import webgazer from "webgazer";
import { OneEuroFilter } from "1eurofilter";

type Props = {
  onGaze: (x: number, y: number) => void;
};

export default function EyeTracking({ onGaze }: Props) {
  const initialized = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const MAX_VELOCITY = 1000;

  // Filter params — stored as state for slider UI, and as refs for use inside the gaze listener
  const [frequency, setFrequency] = useState(60);
  const [mincutoff, setMinCutoff] = useState(0.5);
  const [beta, setBeta] = useState(0.001);
  const [dcutoff, setDCutoff] = useState(1.0);
  const [showPanel, setShowPanel] = useState(true);

  // Refs so the gaze listener closure always sees the latest values
  const frequencyRef = useRef(frequency);
  const mincutoffRef = useRef(mincutoff);
  const betaRef = useRef(beta);
  const dcutoffRef = useRef(dcutoff);

  // Recreate filters whenever params change
  const filterX = useRef(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));
  const filterY = useRef(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));

  useEffect(() => {
    frequencyRef.current = frequency;
    mincutoffRef.current = mincutoff;
    betaRef.current = beta;
    dcutoffRef.current = dcutoff;
    filterX.current = new OneEuroFilter(frequency, mincutoff, beta, dcutoff);
    filterY.current = new OneEuroFilter(frequency, mincutoff, beta, dcutoff);
    initialized.current = false; // reset velocity tracking after filter change
  }, [frequency, mincutoff, beta, dcutoff]);

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

        // Velocity cap to prevent teleporting
        // let targetX = data.x;
        // let targetY = data.y;

        // if (initialized.current) {
        //   const dx = data.x - lastPos.current.x;
        //   const dy = data.y - lastPos.current.y;
        //   const dist = Math.sqrt(dx * dx + dy * dy);

        //   if (dist > MAX_VELOCITY) {
        //     const ratio = MAX_VELOCITY / dist;
        //     targetX = lastPos.current.x + dx * ratio;
        //     targetY = lastPos.current.y + dy * ratio;
        //   }
        // }

        // One Euro Filter
        //const smoothedX = filterX.current.filter(targetX, timestamp);
        //const smoothedY = filterY.current.filter(targetY, timestamp);

        // Bounds check
        const boundedX = Math.max(0, Math.min(window.innerWidth, data.x));
        const boundedY = Math.max(0, Math.min(window.innerHeight, data.y));

        //lastPos.current = { x: data.x, y: data.y };
        initialized.current = true;
        onGaze(boundedX, boundedY);
      });

    return () => {
      webgazer.clearGazeListener();
    };
  }, [onGaze]);

  const sliderStyle: React.CSSProperties = {
    width: "100%",
    accentColor: "#6EC0FF",
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

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 99999,
          background: "#2a2a2e",
          color: "#6EC0FF",
          border: "1px solid #6EC0FF",
          borderRadius: 8,
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "monospace",
        }}
      >
        1€ Filter ⚙
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 99999,
        background: "#1e1e22",
        border: "1px solid #6EC0FF44",
        borderRadius: 12,
        padding: "14px 16px",
        width: 260,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        fontFamily: "monospace",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "#6EC0FF", fontWeight: "bold", fontSize: 13 }}>1€ Filter Tuner</span>
        <button
          onClick={() => setShowPanel(false)}
          style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
        >✕</button>
      </div>

      <div style={rowStyle}>
        <div style={labelStyle}>
          <span>Frequency (Hz)</span>
          <span>{frequency}</span>
        </div>
        <input type="range" min={10} max={240} step={1} value={frequency}
          onChange={e => setFrequency(Number(e.target.value))} style={sliderStyle} />
      </div>

      <div style={rowStyle}>
        <div style={labelStyle}>
          <span>Min Cutoff (Hz)</span>
          <span>{mincutoff.toFixed(3)}</span>
        </div>
        <input type="range" min={0.001} max={10} step={0.001} value={mincutoff}
          onChange={e => setMinCutoff(Number(e.target.value))} style={sliderStyle} />
      </div>

      <div style={rowStyle}>
        <div style={labelStyle}>
          <span>Beta (speed)</span>
          <span>{beta.toFixed(4)}</span>
        </div>
        <input type="range" min={0} max={1} step={0.0001} value={beta}
          onChange={e => setBeta(Number(e.target.value))} style={sliderStyle} />
      </div>

      <div style={rowStyle}>
        <div style={labelStyle}>
          <span>D-Cutoff (Hz)</span>
          <span>{dcutoff.toFixed(2)}</span>
        </div>
        <input type="range" min={0.1} max={10} step={0.01} value={dcutoff}
          onChange={e => setDCutoff(Number(e.target.value))} style={sliderStyle} />
      </div>

      <div style={{ marginTop: 6, fontSize: 10, color: "#666", textAlign: "center" }}>
        ↑ Min cutoff = smoother&nbsp;&nbsp;|&nbsp;&nbsp;↑ Beta = faster
      </div>
    </div>
  );
}
