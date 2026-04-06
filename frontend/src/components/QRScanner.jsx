import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './QRScanner.css';

const QRScanner = ({ onScan, enabled = true }) => {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const startScanner = async () => {
    if (html5QrRef.current || !scannerRef.current) return;

    try {
      setError('');
      const html5Qr = new Html5Qrcode('qr-scanner-element');
      html5QrRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (onScan) onScan(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Scanner error:', err);
      setError(typeof err === 'string' ? err : 'Camera access denied. Please allow camera permission.');
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [enabled]);

  return (
    <div className="qr-scanner-wrapper">
      <div className="qr-scanner-viewport" ref={scannerRef}>
        <div id="qr-scanner-element" className="qr-scanner-element"></div>
        {!isScanning && !error && (
          <div className="qr-scanner-placeholder">
            <div className="scanner-crosshair">
              <span></span><span></span><span></span><span></span>
            </div>
            <p>Initializing camera...</p>
          </div>
        )}
      </div>
      {error && (
        <div className="qr-scanner-error">
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={startScanner}>Try Again</button>
        </div>
      )}
      <div className="qr-scanner-instructions">
        <p>📷 Point your camera at a QR code to scan</p>
      </div>
    </div>
  );
};

export default QRScanner;
