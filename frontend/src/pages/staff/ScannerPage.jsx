import { useState, useCallback, useRef } from 'react';
import QRScanner from '../../components/QRScanner';
import api from '../../api/axios';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamation } from 'react-icons/hi';
import './StaffPages.css';

const ScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);

  const handleScan = useCallback(async (qrData) => {
    // Prevent multiple rapid calls
    if (processingRef.current) return;
    
    processingRef.current = true;
    setProcessing(true);

    try {
      const res = await api.post('/staff/scan', { qrData });
      setScanResult({
        type: 'success',
        message: res.data.message,
        details: res.data.details,
        entryStatus: res.data.entryStatus,
      });
    } catch (err) {
      const errorData = err.response?.data;
      setScanResult({
        type: errorData?.entryStatus === 'duplicate' ? 'duplicate' : 'error',
        message: errorData?.message || 'Scan failed. Please try again.',
        entryStatus: errorData?.entryStatus || 'invalid',
        scanTime: errorData?.scanTime,
      });
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleReset = () => {
    setScanResult(null);
    processingRef.current = false;
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>QR Scanner</h1>
        <p>Scan attendee QR codes to validate entry</p>
      </div>

      <div style={{ position: 'relative' }}>
        {/* We keep the scanner mounted but visually hide it when showing results.
            This prevents the camera from having to restart completely between scans,
            which avoids hardware/permission lag or crashes. */}
        <div className="scanner-container" style={{ display: scanResult ? 'none' : 'block' }}>
          <QRScanner onScan={handleScan} />
          {processing && (
            <div className="scanner-processing">
              <div className="spinner"></div>
              <p>Validating ticket...</p>
            </div>
          )}
        </div>

        {scanResult && (
          <div className="scan-result-container slide-up">
            <div className={`scan-result-card glass-card result-${scanResult.type}`}>
              <div className="scan-result-icon">
                {scanResult.type === 'success' && <HiOutlineCheckCircle />}
                {scanResult.type === 'duplicate' && <HiOutlineExclamation />}
                {scanResult.type === 'error' && <HiOutlineXCircle />}
              </div>
              <h2 className="scan-result-title">
                {scanResult.type === 'success' && 'Entry Approved!'}
                {scanResult.type === 'duplicate' && 'Duplicate Ticket!'}
                {scanResult.type === 'error' && 'Invalid Ticket'}
              </h2>
              <p className="scan-result-message">{scanResult.message}</p>

              {scanResult.details && (
                <div className="scan-result-details">
                  <div className="detail-row"><span>Guest:</span><strong>{scanResult.details.guestName}</strong></div>
                  <div className="detail-row"><span>Event:</span><strong>{scanResult.details.eventTitle}</strong></div>
                  <div className="detail-row"><span>Tickets:</span><strong>{scanResult.details.tickets}</strong></div>
                  <div className="detail-row"><span>Scan Time:</span><strong>{new Date(scanResult.details.scanTime).toLocaleTimeString()}</strong></div>
                </div>
              )}

              {scanResult.scanTime && (
                <p className="scan-result-prev-time">Previously scanned: {new Date(scanResult.scanTime).toLocaleString()}</p>
              )}

              <button className="btn btn-primary btn-lg" onClick={handleReset} style={{ marginTop: '24px', width: '100%' }} id="scan-next-btn">
                Scan Next Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
