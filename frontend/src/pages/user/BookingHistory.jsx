import { useState, useEffect } from 'react';
import api from '../../api/axios';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import toast from 'react-hot-toast';
import './UserPages.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleViewQR = async (booking) => {
    try {
      const res = await api.get(`/bookings/${booking.id}/qr`);
      setSelectedBooking({ ...booking, qr: res.data.qr_code });
    } catch (err) {
      toast.error('Failed to load QR code');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>View your booking history and download QR tickets</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>No bookings yet</h3>
          <p>Browse events and book your first ticket!</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const eventDate = new Date(booking.event?.event_date);
            const isPast = eventDate < new Date();
            return (
              <div key={booking.id} className="booking-item glass-card fade-in">
                <div className="booking-info">
                  <div className="booking-event-name">{booking.event?.title || 'Event'}</div>
                  <div className="booking-details">
                    <span>📅 {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>📍 {booking.event?.location}</span>
                    <span>🎫 {booking.number_of_tickets} ticket{booking.number_of_tickets > 1 ? 's' : ''}</span>
                  </div>
                  <div className="booking-meta">
                    <span className={`badge badge-${booking.booking_status}`}>{booking.booking_status}</span>
                    {booking.attendanceLog && (
                      <span className="badge badge-valid">✓ Attended</span>
                    )}
                    <span className="booking-id">ID: {booking.id.substring(0, 8)}...</span>
                  </div>
                </div>
                <div className="booking-actions">
                  {booking.booking_status === 'confirmed' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleViewQR(booking)} id={`view-qr-${booking.id}`}>
                        📱 View QR
                      </button>
                      {!isPast && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(booking.id)} id={`cancel-${booking.id}`}>
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your QR Ticket</h2>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>
            <div className="qr-modal-body">
              <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>{selectedBooking.event?.title}</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                {selectedBooking.number_of_tickets} ticket{selectedBooking.number_of_tickets > 1 ? 's' : ''} · {new Date(selectedBooking.event?.event_date).toLocaleDateString()}
              </p>
              {selectedBooking.qr ? (
                <QRCodeDisplay data={JSON.stringify({ bookingId: selectedBooking.id, userId: selectedBooking.user_id, eventId: selectedBooking.event_id })} title={selectedBooking.event?.title} />
              ) : (
                <div className="loading-spinner"><div className="spinner"></div></div>
              )}
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '16px' }}>
                Present this QR code at the event entrance
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
