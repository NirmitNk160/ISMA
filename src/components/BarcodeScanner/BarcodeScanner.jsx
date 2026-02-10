import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

export default function BarcodeScanner({ onScan }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const scannedRef = useRef(false);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [torchOn, setTorchOn] = useState(false);

  /* ---------------- CAMERA LIST ---------------- */
  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((cams) => {
        setDevices(cams);

        if (!cams.length) {
          setError("No camera found");
          return;
        }

        // Prefer back camera
        const back =
          cams.find((d) =>
            d.label.toLowerCase().includes("back")
          ) || cams[0];

        setSelectedDevice(back.deviceId);
      })
      .catch(() => setError("Camera permission denied"));
  }, []);

  /* ---------------- SCANNER START ---------------- */
  useEffect(() => {
    if (!selectedDevice) return;

    setLoading(true);

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
    ]);

    const reader = new BrowserMultiFormatReader(hints);

    reader.decodeFromVideoDevice(
      selectedDevice,
      videoRef.current,
      (result, err, controls) => {
        controlsRef.current = controls;
        setLoading(false);

        if (result && !scannedRef.current) {
          scannedRef.current = true;

          const text = result.getText();

          // Stop camera
          controls.stop();
          stopCameraStream();

          // Feedback
          navigator.vibrate?.(120);
          new Audio(
            "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
          ).play().catch(() => {});

          onScan?.(text);
        }

        if (err && err.name !== "NotFoundException") {
          console.error(err);
        }
      }
    );

    return () => stopCameraStream();
  }, [selectedDevice, onScan]);

  /* ---------------- STOP CAMERA ---------------- */
  const stopCameraStream = () => {
    controlsRef.current?.stop();
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  /* ---------------- TORCH CONTROL ---------------- */
  const toggleTorch = async () => {
    const stream = videoRef.current?.srcObject;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (!capabilities.torch) {
      alert("Torch not supported on this device");
      return;
    }

    await track.applyConstraints({
      advanced: [{ torch: !torchOn }],
    });

    setTorchOn(!torchOn);
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: 20,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        maxWidth: 420,
        margin: "auto",
      }}
    >
      <h3>Scan Barcode</h3>

      {error && (
        <p style={{ color: "red", marginBottom: 10 }}>
          {error}
        </p>
      )}

      {/* CAMERA SELECTOR */}
      {devices.length > 1 && (
        <select
          value={selectedDevice}
          onChange={(e) => {
            scannedRef.current = false;
            setSelectedDevice(e.target.value);
          }}
          style={{
            padding: 8,
            marginBottom: 12,
            borderRadius: 8,
            width: "100%",
          }}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || "Camera"}
            </option>
          ))}
        </select>
      )}

      {/* TORCH BUTTON */}
      <button
        onClick={toggleTorch}
        style={{
          marginBottom: 10,
          padding: "6px 12px",
          borderRadius: 8,
          border: "none",
          background: "#222",
          color: "#fff",
        }}
      >
        {torchOn ? "Flash OFF" : "Flash ON"}
      </button>

      {/* LOADING */}
      {loading && <p>Starting camera...</p>}

      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          style={{
            width: "100%",
            borderRadius: 12,
          }}
        />

        {/* SCAN OVERLAY */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "10%",
            width: "80%",
            height: 80,
            border: "3px solid #00ff88",
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
