import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function BarcodeScanner({ onScan }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices.length) {
          alert("No camera found");
          return;
        }

        await scanner.start(
          devices[0].id,
          {
            fps: 15,

            /* ⭐ IMPORTANT */
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],

            /* ⭐ Better box for barcode */
            qrbox: { width: 350, height: 120 },

            aspectRatio: 1.7,
          },

          (decodedText) => {
            onScan(decodedText);
            scanner.stop();
          }
        );
      } catch (err) {
        console.error(err);
        alert("Camera start failed");
      }
    };

    startScanner();

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return <div id="reader" style={{ width: "100%" }} />;
}
