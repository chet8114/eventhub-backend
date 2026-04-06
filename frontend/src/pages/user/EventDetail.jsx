import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUsers, HiOutlineTag } from 'react-icons/hi';
import './UserPages.css';

const EventDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
      } catch (err) {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    if (user.role !== 'user') {
      toast.error('Only users can book tickets');
      return;
    }
    setBooking(true);
    try {
      const res = await api.post('/bookings', { event_id: parseInt(id), number_of_tickets: tickets });
      toast.success('Booking confirmed! Check your bookings for the QR code.');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const isSoldOut = event.available_seats === 0;

  return (
    <div className="page-container">
      <div className="event-detail slide-up">
        <div className="event-detail-hero">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
            alt={event.title}
            className="event-detail-image"
          />
          <div className="event-detail-hero-overlay">
            <span className="event-detail-category">{event.category}</span>
            <h1 className="event-detail-title">{event.title}</h1>
          </div>
        </div>

        <div className="event-detail-content">
          <div className="event-detail-main">
            <div className="event-detail-meta glass-card">
              <div className="detail-meta-item">
                <HiOutlineCalendar />
                <div>
                  <span className="meta-label">Date & Time</span>
                  <span className="meta-value">{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="detail-meta-item">
                <HiOutlineLocationMarker />
                <div>
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{event.location}</span>
                </div>
              </div>
              <div className="detail-meta-item">
                <HiOutlineUsers />
                <div>
                  <span className="meta-label">Availability</span>
                  <span className="meta-value">{event.available_seats} of {event.capacity} seats available</span>
                </div>
              </div>
              <div className="detail-meta-item">
                <HiOutlineTag />
                <div>
                  <span className="meta-label">Category</span>
                  <span className="meta-value">{event.category}</span>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>About This Event</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{event.description}</p>
            </div>
          </div>

          <div className="event-detail-sidebar">
            <div className="glass-card booking-card">
              <h3 style={{ marginBottom: '20px' }}>Book Tickets</h3>

              {isPast ? (
                <div className="booking-status-msg error">This event has already passed.</div>
              ) : isSoldOut ? (
                <div className="booking-status-msg error">This event is sold out.</div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Number of Tickets</label>
                    <div className="ticket-selector">
                      <button className="btn btn-secondary btn-sm" onClick={() => setTickets(Math.max(1, tickets - 1))}>−</button>
                      <span className="ticket-count">{tickets}</span>
                      <button className="btn btn-secondary btn-sm" onClick={() => setTickets(Math.min(10, Math.min(event.available_seats, tickets + 1)))}>+</button>
                    </div>
                    <p className="ticket-hint">{event.available_seats} seats remaining · Max 10 per booking</p>
                  </div>

                  <div className="seats-bar">
                    <div className="seats-bar-fill" style={{ width: `${((event.capacity - event.available_seats) / event.capacity) * 100}%` }}></div>
                  </div>
                  <p className="seats-text">{Math.round(((event.capacity - event.available_seats) / event.capacity) * 100)}% booked</p>

                  <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px' }} onClick={handleBook} disabled={booking} id="book-btn">
                    {booking ? 'Booking...' : `Book ${tickets} Ticket${tickets > 1 ? 's' : ''}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
