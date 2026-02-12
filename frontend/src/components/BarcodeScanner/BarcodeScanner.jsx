import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onScan }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const lastScan = useRef(0);

  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------- INIT CAMERA ---------- */
  useEffect(() => {
    async function initCamera() {
      try {
        // request permission first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((t) => t.stop());

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

    initCamera();
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
        setLoading(false);

        if (result) {
          const text = result.getText();
          const now = Date.now();

          // Prevent duplicate scans of same code
          if (
            text === lastScan.current?.code &&
            now - lastScan.current?.time < 2500
          ) {
            return;
          }

          lastScan.current = {
            code: text,
            time: now,
          };

          onScan?.(text);
        }

        if (err && err.name !== "NotFoundException") {
          console.log(err);
        }
      },
    );

    return () => {
      try {
        readerRef.current?.stopContinuousDecode?.();

        const stream = videoRef.current?.srcObject;
        stream?.getTracks().forEach((t) => t.stop());
      } catch {}
    };
  }, [deviceId, onScan]);

  /* ---------- UI ---------- */
  return (
    <div style={{ textAlign: "center" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <select
        value={deviceId}
        onChange={(e) => setDeviceId(e.target.value)}
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

        {/* Scan line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
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
