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

  /* ---------- CAMERA INIT ---------- */
  useEffect(() => {
    async function init() {
      try {
        // ask permission first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach(t => t.stop());

        const cams = await BrowserMultiFormatReader.listVideoInputDevices();

        if (!cams.length) {
          setError("No camera found");
          return;
        }

        setDevices(cams);
        setDeviceId(cams[0].deviceId);
      } catch {
        setError("Camera permission denied");
      }
    }

    init();
  }, []);

  /* ---------- START SCANNER ---------- */
  useEffect(() => {
    if (!deviceId || !videoRef.current) return;

    readerRef.current = new BrowserMultiFormatReader();
    setLoading(true);

    readerRef.current.decodeFromVideoDevice(
      deviceId,
      videoRef.current,
      (result, err, controls) => {
        controlsRef.current = controls;
        setLoading(false);

        if (result) {
          const text = result.getText();
          const now = Date.now();

          // Strong duplicate prevention
          if (
            text === lastScanRef.current.code &&
            now - lastScanRef.current.time < 3000
          ) {
            return;
          }

          lastScanRef.current = { code: text, time: now };

          navigator.vibrate?.(80);
          onScan?.(text);
        }

        if (err && err.name !== "NotFoundException") {
          console.log(err);
        }
      }
    );

    return () => stopCamera();
  }, [deviceId, onScan]);

  /* ---------- STOP CAMERA ---------- */
  const stopCamera = () => {
    try {
      controlsRef.current?.stop();

      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach(t => t.stop());
    } catch {}
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ textAlign: "center" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Camera selector */}
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

      {loading && <p>Starting camera...</p>}

      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", borderRadius: 12 }}
        />

        {/* scanning line */}
        <div
          style={{
            position: "absolute",
            left: "10%",
            width: "80%",
            height: 2,
            background: "#00ff88",
            animation: "scan 2s infinite linear",
          }}
        />
      </div>
    </div>
  );
}

/* animation */
const style = document.createElement("style");
style.innerHTML = `
@keyframes scan {
  0% { top:20%; }
  50% { top:70%; }
  100% { top:20%; }
}`;
document.head.appendChild(style);
