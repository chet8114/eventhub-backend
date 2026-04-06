import { Link } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUsers } from 'react-icons/hi';
import './EventCard.css';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const isSoldOut = event.available_seats === 0;
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  return (
    <Link to={`/events/${event.id}`} className={`event-card ${isPast ? 'past' : ''}`} id={`event-card-${event.id}`}>
      <div className="event-card-image">
        <img
          src={event.image_url || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400`}
          alt={event.title}
          loading="lazy"
        />
        <div className="event-card-date">
          <span className="date-month">{month}</span>
          <span className="date-day">{day}</span>
        </div>
        {isPast && <div className="event-card-overlay">Past Event</div>}
        {isSoldOut && !isPast && <div className="event-card-overlay sold-out">Sold Out</div>}
        <span className="event-card-category">{event.category}</span>
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-desc">{event.description?.substring(0, 100)}{event.description?.length > 100 ? '...' : ''}</p>
        <div className="event-card-meta">
          <span className="meta-item">
            <HiOutlineLocationMarker />
            {event.location?.substring(0, 30)}
          </span>
          <span className="meta-item">
            <HiOutlineUsers />
            {event.available_seats}/{event.capacity} seats
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
