import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./BarcodeScanner.css";

export default function BarcodeScanner({ onScan, onCancel }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "scanner",
      {
        fps: 10,
        qrbox: { width: 250, height: 120 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan?.(decodedText);
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => scanner.clear().catch(() => {});
  }, [onScan]);

  const handleCancel = () => {
    scannerRef.current?.clear();
    onCancel?.();
  };

  return (
    <div className="barcode-wrapper">
      <div id="scanner"></div>

      <button className="cancel-btn" onClick={handleCancel}>
        Cancel
      </button>
    </div>
  );
}
