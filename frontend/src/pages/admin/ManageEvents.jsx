import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import EventForm from './EventForm';
import './AdminPages.css';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events', { params: { limit: 100 } });
      setEvents(res.data.events);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setEditEvent(event);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditEvent(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditEvent(null);
    fetchEvents();
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Manage Events</h1>
          <p>Create, edit, and manage your events</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate} id="create-event-btn">
          <HiOutlinePlus /> Create Event
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Date</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td><strong>{ev.title}</strong></td>
                <td><span className="badge badge-admin">{ev.category}</span></td>
                <td>{new Date(ev.event_date).toLocaleDateString()}</td>
                <td>{ev.location?.substring(0, 25)}</td>
                <td>{ev.capacity}</td>
                <td>{ev.available_seats}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(ev)} id={`edit-event-${ev.id}`}>
                      <HiOutlinePencil />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)} id={`delete-event-${ev.id}`}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No events created yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && <EventForm event={editEvent} onClose={handleFormClose} />}
    </div>
  );
};

export default ManageEvents;
