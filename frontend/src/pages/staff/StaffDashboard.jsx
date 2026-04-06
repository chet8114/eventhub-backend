import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineQrcode, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import './StaffPages.css';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/staff/history');
        setHistory(res.data.logs);
      } catch (err) {
        console.error('History error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const validScans = history.filter(h => h.entry_status === 'valid').length;
  const invalidScans = history.filter(h => h.entry_status !== 'valid').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Staff Dashboard</h1>
        <p>Welcome, {user?.name}! Ready to scan tickets.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="stat-card fade-in">
          <div className="stat-icon" style={{ color: '#6366f1' }}><HiOutlineQrcode /></div>
          <div className="stat-value">{history.length}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon" style={{ color: '#22c55e' }}><HiOutlineCheckCircle /></div>
          <div className="stat-value">{validScans}</div>
          <div className="stat-label">Valid Entries</div>
        </div>
        <div className="stat-card fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon" style={{ color: '#ef4444' }}><HiOutlineXCircle /></div>
          <div className="stat-value">{invalidScans}</div>
          <div className="stat-label">Rejected Scans</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Link to="/staff/scan" className="btn btn-primary btn-lg" id="open-scanner-btn" style={{ fontSize: '1.1rem', padding: '18px 40px' }}>
          <HiOutlineQrcode style={{ fontSize: '1.4rem' }} /> Open QR Scanner
        </Link>
      </div>

      <div className="glass-card">
        <h2 className="section-title">Recent Scans</h2>
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📷</div>
            <h3>No scans yet</h3>
            <p>Start scanning QR codes at event entrances</p>
          </div>
        ) : (
          <div className="scan-history-list">
            {history.slice(0, 20).map((log) => (
              <div key={log.id} className={`scan-history-item status-${log.entry_status}`}>
                <div className="scan-status-icon">
                  {log.entry_status === 'valid' ? '✅' : log.entry_status === 'duplicate' ? '⚠️' : '❌'}
                </div>
                <div className="scan-info">
                  <span className="scan-guest">{log.booking?.user?.name || 'Unknown'}</span>
                  <span className="scan-event">{log.booking?.event?.title || 'Unknown Event'}</span>
                </div>
                <div className="scan-meta">
                  <span className={`badge badge-${log.entry_status}`}>{log.entry_status}</span>
                  <span className="scan-time">{new Date(log.scan_time).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
