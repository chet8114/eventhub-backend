import { useState, useEffect } from 'react';
import api from '../../api/axios';
import EventCard from '../../components/EventCard';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';
import './UserPages.css';

const CATEGORIES = ['All', 'Conference', 'Workshop', 'Seminar', 'Concert', 'Sports', 'Meetup', 'Other'];

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (dateFilter) params.date = dateFilter;

      const res = await api.get('/events', { params });
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, category, dateFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Discover Events</h1>
        <p>Find and book amazing events happening near you</p>
      </div>

      <div className="events-filters glass-card">
        <form onSubmit={handleSearch} className="search-bar">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search events by name, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="event-search-input"
          />
          <button type="submit" className="btn btn-primary btn-sm" id="event-search-btn">Search</button>
        </form>
        <div className="filter-row">
          <div className="filter-group">
            <HiOutlineFilter />
            <select className="form-input" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} id="category-filter">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              id="date-filter"
            />
            {dateFilter && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setDateFilter(''); setPage(1); }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎭</div>
          <h3>No events found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="events-grid">
            {events.map((event, i) => (
              <div key={event.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span className="page-info">Page {pagination.page} of {pagination.pages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;
