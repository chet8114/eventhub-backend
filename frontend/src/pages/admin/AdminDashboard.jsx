import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { HiOutlineUsers, HiOutlineCalendar, HiOutlineTicket, HiOutlineCheckCircle } from 'react-icons/hi';
import './AdminPages.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!data) return null;

  const { stats, eventStats, recentBookings } = data;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your event management system</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="stat-icon" style={{ color: '#6366f1' }}><HiOutlineUsers /></div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon" style={{ color: '#a855f7' }}><HiOutlineCalendar /></div>
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="stat-icon" style={{ color: '#22c55e' }}><HiOutlineTicket /></div>
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon" style={{ color: '#f59e0b' }}><HiOutlineCheckCircle /></div>
          <div className="stat-value">{stats.totalAttendance}</div>
          <div className="stat-label">Attendance Scans</div>
        </div>
      </div>

      <div className="admin-grid">
        {/* Event Attendance Stats */}
        <div className="glass-card fade-in">
          <h2 className="section-title">Event Attendance</h2>
          {eventStats.length === 0 ? (
            <div className="empty-state"><p>No events to show</p></div>
          ) : (
            <div className="event-stats-list">
              {eventStats.map((ev) => {
                const booked = parseInt(ev.dataValues?.totalBookings || ev.get?.('totalBookings') || 0);
                const attended = parseInt(ev.dataValues?.totalAttendance || ev.get?.('totalAttendance') || 0);
                const pct = ev.capacity > 0 ? Math.round(((ev.capacity - ev.available_seats) / ev.capacity) * 100) : 0;
                return (
                  <div key={ev.id} className="event-stat-row">
                    <div className="event-stat-info">
                      <span className="event-stat-name">{ev.title}</span>
                      <span className="event-stat-date">
                        {new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="event-stat-bar-container">
                      <div className="event-stat-bar">
                        <div className="event-stat-bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="event-stat-pct">{pct}%</span>
                    </div>
                    <div className="event-stat-numbers">
                      <span>{booked} booked</span>
                      <span>{attended} attended</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="glass-card fade-in">
          <h2 className="section-title">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <div className="empty-state"><p>No bookings yet</p></div>
          ) : (
            <div className="recent-bookings-list">
              {recentBookings.map((b) => (
                <div key={b.id} className="recent-booking-item">
                  <div className="rb-avatar">{b.user?.name?.charAt(0) || '?'}</div>
                  <div className="rb-info">
                    <span className="rb-name">{b.user?.name}</span>
                    <span className="rb-event">{b.event?.title}</span>
                  </div>
                  <div className="rb-meta">
                    <span className={`badge badge-${b.booking_status}`}>{b.booking_status}</span>
                    <span className="rb-date">{new Date(b.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
