import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onScan }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);

  const lastScanRef = useRef({ code: null, time: 0 });

  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const [continuous, setContinuous] = useState(true);
  const [scanFeedback, setScanFeedback] = useState(false);
  const [playSound, setPlaySound] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  /* CAMERA INIT */
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        stream.getTracks().forEach(t => t.stop());

        const cams = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!cams.length) return setError("No camera found");

        setDevices(cams);
        setDeviceId(cams[0].deviceId);
      } catch {
        setError("Camera permission denied");
      }
    }

    initCamera();
  }, []);

  /* START SCANNER */
  useEffect(() => {
    if (!deviceId || !videoRef.current || paused) return;

    readerRef.current = new BrowserMultiFormatReader();
    setLoading(true);

    readerRef.current.decodeFromVideoDevice(
      deviceId,
      videoRef.current,
      async (result, err, controls) => {
        controlsRef.current = controls;
        setLoading(false);

        if (result) {
          const text = result.getText();
          const now = Date.now();

          // Strong duplicate prevention
          if (
            text === lastScanRef.current.code &&
            now - lastScanRef.current.time < 2500
          ) return;

          lastScanRef.current = { code: text, time: now };

          navigator.vibrate?.(60);

          if (playSound) {
            new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg")
              .play()
              .catch(() => {});
          }

          setScanFeedback(true);
          setTimeout(() => setScanFeedback(false), 300);

          setRecentScans(prev => [text, ...prev.slice(0, 4)]);

          onScan?.(text);

          if (!continuous) setPaused(true);
        }

        if (err && err.name !== "NotFoundException") console.log(err);
      }
    );

    return stopCamera;
  }, [deviceId, paused, continuous, playSound, onScan]);

  /* STOP CAMERA */
  const stopCamera = () => {
    try {
      controlsRef.current?.stop();
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach(t => t.stop());
    } catch {}
  };

  /* AUTOFOCUS TRY */
  useEffect(() => {
    const stream = videoRef.current?.srcObject;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const caps = track.getCapabilities?.();

    if (caps?.focusMode) {
      track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
    }
  }, [deviceId]);

  return (
    <div style={{ textAlign: "center" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <select
        value={deviceId}
        onChange={e => setDeviceId(e.target.value)}
        style={{ padding: 8, marginBottom: 10 }}
      >
        {devices.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `Camera ${i + 1}`}
          </option>
        ))}
      </select>

      <div style={{ marginBottom: 8 }}>
        <button onClick={() => setPaused(p => !p)}>
          {paused ? "Resume" : "Pause"}
        </button>

        <button onClick={() => setContinuous(c => !c)} style={{ marginLeft: 8 }}>
          {continuous ? "Continuous ON" : "Continuous OFF"}
        </button>

        <button onClick={() => setPlaySound(s => !s)} style={{ marginLeft: 8 }}>
          {playSound ? "Sound ON" : "Sound OFF"}
        </button>
      </div>

      {loading && <p>Starting camera...</p>}

      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", borderRadius: 12 }}
        />

        <div
          style={{
            position: "absolute",
            left: "10%",
            width: "80%",
            height: 2,
            background: scanFeedback ? "#00ff00" : "#00ff88",
            animation: "scan 2s infinite linear"
          }}
        />
      </div>

      {recentScans.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
          <b>Recent scans:</b>
          {recentScans.map((s, i) => (
            <div key={i}>{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

const style = document.createElement("style");
style.innerHTML = `
@keyframes scan {
  0% { top:20%; }
  50% { top:70%; }
  100% { top:20%; }
}`;
document.head.appendChild(style);