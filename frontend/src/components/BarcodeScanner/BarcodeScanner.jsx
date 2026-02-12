import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

/*
  ISMA ULTRA BARCODE SCANNER – FINAL PRO VERSION
  --------------------------------------------
  ✔ Ultra fast scanning (lower decode delay)
  ✔ Continuous multi-item scanning stable
  ✔ Proper camera full stop (no tab indicator bug)
  ✔ PhonePe-style scanning UI
  ✔ Instant sound + vibration
  ✔ Auto inactivity stop (battery save)
  ✔ Scan history overlay
  ✔ Pause / Resume
  ✔ Sound toggle
  ✔ Clean single-file implementation
*/

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const beepRef = useRef(null);
  const inactivityTimer = useRef(null);

  const lastScanRef = useRef({ code: null, time: 0 });

  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);
  const [paused, setPaused] = useState(false);
  const [continuous, setContinuous] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [history, setHistory] = useState([]);

  /* preload sound */
  useEffect(() => {
    beepRef.current = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );
    beepRef.current.preload = "auto";
  }, []);

  /* camera init */
  useEffect(() => {
    async function init() {
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

    init();
  }, []);

  /* inactivity auto-stop */
  const resetInactivity = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => finish(), 60000);
  };

  /* start scanner */
  useEffect(() => {
    if (!deviceId || paused) return;

    readerRef.current = new BrowserMultiFormatReader(undefined, 250);

    readerRef.current.decodeFromVideoDevice(
      deviceId,
      videoRef.current,
      (result, err, controls) => {
        controlsRef.current = controls;
        streamRef.current = videoRef.current?.srcObject;

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
              beepRef.current.play().catch(() => {});
            } catch {}
          }

          navigator.vibrate?.(40);

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
      <div className="scanner-top">
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
          Done Billing
        </button>
      </div>

      <div className="video-wrap">
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

/* PRO CSS */
const style = document.createElement("style");
style.innerHTML = `
.scanner-root{background:#000;color:#fff;padding:14px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.scanner-top{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.scanner-top button,.scanner-top select{padding:6px 10px;border-radius:8px;border:none;background:#1f2937;color:#fff}
.finish{background:#22c55e}
.video-wrap{position:relative;border-radius:16px;overflow:hidden}
video{width:100%;opacity:.92}
.scan-frame{position:absolute;inset:10%;border:2px solid rgba(0,255,150,.6);border-radius:12px}
.scan-line{position:absolute;left:10%;width:80%;height:2px;background:#00ffa6;animation:scan 1.6s linear infinite}
@keyframes scan{0%{top:15%}50%{top:75%}100%{top:15%}}
.scan-history{margin-top:8px;font-size:12px;opacity:.9}
`;
document.head.appendChild(style);