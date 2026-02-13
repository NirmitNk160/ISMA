// ===============================
// BarcodeScanner.jsx (UPDATED)
// ===============================
import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "./BarcodeScanner.css";

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const beepRef = useRef(null);
  const inactivityTimer = useRef(null);
  const lastScanRef = useRef({ code: null, time: 0 });

  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [paused, setPaused] = useState(false);
  const [continuous, setContinuous] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [history, setHistory] = useState([]);
  const [scanFlash, setScanFlash] = useState(false);

  useEffect(() => {
    beepRef.current = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );
    beepRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    async function initCamera() {
      try {
        const tmp = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 640, height: 480 }
        });
        tmp.getTracks().forEach(t => t.stop());

        const cams = await BrowserMultiFormatReader.listVideoInputDevices();
        setDevices(cams);
        if (cams.length) setDeviceId(cams[0].deviceId);
      } catch {}
    }

    initCamera();
  }, []);

  const resetInactivity = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => finish(), 60000);
  };

  useEffect(() => {
    if (!deviceId || paused) return;

    readerRef.current = new BrowserMultiFormatReader(undefined, 200);

    readerRef.current.decodeFromVideoDevice(
      deviceId,
      videoRef.current,
      async (result, err, controls) => {
        controlsRef.current = controls;
        streamRef.current = videoRef.current?.srcObject;

        try {
          const track = streamRef.current?.getVideoTracks?.()[0];
          const caps = track?.getCapabilities?.();
          if (caps?.focusMode)
            track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
        } catch {}

        if (result) {
          resetInactivity();

          const text = result.getText();
          const now = Date.now();

          if (
            text === lastScanRef.current.code &&
            now - lastScanRef.current.time < 1400
          ) return;

          lastScanRef.current = { code: text, time: now };

          if (soundOn) {
            try {
              beepRef.current.currentTime = 0;
              await beepRef.current.play().catch(() => {});
            } catch {}
          }

          navigator.vibrate?.(40);

          setScanFlash(true);
          setTimeout(() => setScanFlash(false), 250);

          setHistory(h => [text, ...h.slice(0, 4)]);

          onScan?.(text);

          if (!continuous) setPaused(true);
        }

        if (err && err.name !== "NotFoundException") console.log(err);
      }
    );

    return stopCamera;
  }, [deviceId, paused, continuous, soundOn, onScan]);

  const stopCamera = () => {
    try {
      controlsRef.current?.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
  };

  const finish = () => {
    stopCamera();
    onClose?.();
  };

  return (
    <div className="scanner-root">
      <div className="scanner-controls">
        <select value={deviceId} onChange={e => setDeviceId(e.target.value)}>
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || "Camera"}
            </option>
          ))}
        </select>

        <button onClick={() => setPaused(p => !p)}>
          {paused ? "Resume" : "Pause"}
        </button>

        <button onClick={() => setContinuous(c => !c)}>
          {continuous ? "Continuous" : "Single"}
        </button>

        <button onClick={() => setSoundOn(s => !s)}>
          {soundOn ? "Sound ON" : "Sound OFF"}
        </button>

        <button className="finish" onClick={finish}>
          Close Scanner
        </button>
      </div>

      <div className={`video-wrap ${scanFlash ? "flash" : ""}`}>
        <video ref={videoRef} autoPlay muted playsInline />
        <div className="scan-frame" />
        <div className="scan-line" />
      </div>

      <div className="scan-history">
        <b>Recent scans:</b>
        {history.map((h, i) => (
          <div key={i}>{h}</div>
        ))}
      </div>
    </div>
  );
}