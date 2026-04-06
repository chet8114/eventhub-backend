import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Conference', 'Workshop', 'Seminar', 'Concert', 'Sports', 'Meetup', 'Other'];

const EventForm = ({ event, onClose }) => {
  const isEdit = !!event;
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    category: event?.category || 'Other',
    event_date: event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
    capacity: event?.capacity || 100,
    image_url: event?.image_url || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.event_date || !form.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/events/${event.id}`, form);
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', form);
        toast.success('Event created successfully');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} id="event-form">
          <div className="form-group">
            <label>Title *</label>
            <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="Event title" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-input" rows="4" value={form.description} onChange={handleChange} placeholder="Describe your event..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Location *</label>
              <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="Venue name" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Date & Time *</label>
              <input name="event_date" type="datetime-local" className="form-input" value={form.event_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Capacity *</label>
              <input name="capacity" type="number" className="form-input" value={form.capacity} onChange={handleChange} min="1" />
            </div>
          </div>
          <div className="form-group">
            <label>Image URL (optional)</label>
            <input name="image_url" className="form-input" value={form.image_url} onChange={handleChange} placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="event-form-submit">
              {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
