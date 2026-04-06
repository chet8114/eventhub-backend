import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineDownload } from 'react-icons/hi';
import './AdminPages.css';

const AttendanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/attendance');
        setLogs(res.data.logs);
      } catch (err) {
        toast.error('Failed to load attendance logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/attendance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Attendance Logs</h1>
          <p>Track all QR scan entries and attendance data</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport} id="export-csv-btn">
          <HiOutlineDownload /> Export CSV
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No attendance logs yet</h3>
          <p>Logs will appear when staff members scan QR codes at events</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Event</th>
                <th>Tickets</th>
                <th>Scan Time</th>
                <th>Status</th>
                <th>Scanned By</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div>
                      <strong>{log.booking?.user?.name || 'N/A'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.booking?.user?.email}</div>
                    </div>
                  </td>
                  <td>{log.booking?.event?.title || 'N/A'}</td>
                  <td>{log.booking?.number_of_tickets || 0}</td>
                  <td>{new Date(log.scan_time).toLocaleString()}</td>
                  <td><span className={`badge badge-${log.entry_status}`}>{log.entry_status}</span></td>
                  <td>{log.scannedBy?.name || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceLogs;
