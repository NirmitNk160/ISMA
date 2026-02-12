import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

/*
  FINAL ENHANCED ISMA BARCODE SCANNER
  ----------------------------------
  ✔ True continuous scanning
  ✔ Instant scan sound (no delay)
  ✔ Live scan counter + last scanned item display
  ✔ Stop/Finish button to return to billing
  ✔ Proper ZXing cleanup (no camera freeze)
  ✔ Smooth modern UI
*/

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const beepRef = useRef(null);

  const lastScanRef = useRef({ code: null, time: 0 });

  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [continuous, setContinuous] = useState(true);
  const [paused, setPaused] = useState(false);

  const [scanCount, setScanCount] = useState(0);
  const [lastCode, setLastCode] = useState("");

  /* preload instant beep */
  useEffect(() => {
    beepRef.current = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );
    beepRef.current.preload = "auto";
  }, []);

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
      (result, err, controls) => {
        controlsRef.current = controls;
        setLoading(false);

        if (result) {
          const text = result.getText();
          const now = Date.now();

          /* duplicate prevention */
          if (
            text === lastScanRef.current.code &&
            now - lastScanRef.current.time < 1800
          ) return;

          lastScanRef.current = { code: text, time: now };

          /* instant beep */
          try {
            beepRef.current.currentTime = 0;
            beepRef.current.play().catch(() => {});
          } catch {}

          navigator.vibrate?.(50);

          setScanCount(c => c + 1);
          setLastCode(text);

          onScan?.(text);

          if (!continuous) setPaused(true);
        }

        if (err && err.name !== "NotFoundException") console.log(err);
      }
    );

    return stopCamera;
  }, [deviceId, paused, continuous, onScan]);

  /* STOP CAMERA */
  const stopCamera = () => {
    try {
      controlsRef.current?.stop();
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach(t => t.stop());
    } catch {}
  };

  const finishScanning = () => {
    stopCamera();
    onClose?.();
  };

  return (
    <div className="scanner-root">
      {error && <p className="scanner-error">{error}</p>}

      <div className="scanner-topbar">
        <select
          value={deviceId}
          onChange={e => setDeviceId(e.target.value)}
        >
          {devices.map((d, i) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${i + 1}`}
            </option>
          ))}
        </select>

        <button onClick={() => setPaused(p => !p)}>
          {paused ? "Resume" : "Pause"}
        </button>

        <button onClick={() => setContinuous(c => !c)}>
          {continuous ? "Continuous" : "Single"}
        </button>

        <button className="finish-btn" onClick={finishScanning}>
          Done Billing
        </button>
      </div>

      {loading && <p className="scanner-loading">Starting camera...</p>}

      <div className="scanner-video-wrap">
        <video ref={videoRef} autoPlay muted playsInline />
        <div className="scan-line" />
      </div>

      <div className="scanner-stats">
        <div>
          <b>Total Scanned:</b> {scanCount}
        </div>
        {lastCode && (
          <div className="last-scan">Last: {lastCode}</div>
        )}
      </div>
    </div>
  );
}

/* CSS injected automatically */
const style = document.createElement("style");
style.innerHTML = `
.scanner-root{
  background:#fff;
  padding:16px;
  border-radius:18px;
  box-shadow:0 10px 35px rgba(0,0,0,.18);
}

.scanner-topbar{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin-bottom:10px;
}

.scanner-topbar select,
.scanner-topbar button{
  padding:6px 10px;
  border-radius:8px;
  border:none;
  background:#f3f4f6;
  cursor:pointer;
}

.finish-btn{
  background:#16a34a !important;
  color:#fff;
}

.scanner-video-wrap{
  position:relative;
}

.scanner-video-wrap video{
  width:100%;
  border-radius:14px;
}

.scan-line{
  position:absolute;
  left:10%;
  width:80%;
  height:2px;
  background:#00ff88;
  animation:scan 2s infinite linear;
}

@keyframes scan{
  0%{top:20%}
  50%{top:70%}
  100%{top:20%}
}

.scanner-stats{
  margin-top:10px;
  font-size:13px;
  opacity:.9;
}

.last-scan{
  margin-top:4px;
  color:#16a34a;
}
`;
document.head.appendChild(style);
