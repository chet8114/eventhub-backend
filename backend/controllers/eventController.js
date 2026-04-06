const { Op } = require('sequelize');
const { Event, User, Booking } = require('../models');

// Get all events (with search / filter / pagination)
exports.getAllEvents = async (req, res) => {
  try {
    const { search, category, date, page = 1, limit = 12 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.event_date = { [Op.between]: [startOfDay, endOfDay] };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: events, count: total } = await Event.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['event_date', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('GetAllEvents error:', error);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
};

// Get single event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Booking, as: 'bookings', attributes: ['id'] },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json({ event });
  } catch (error) {
    console.error('GetEventById error:', error);
    res.status(500).json({ message: 'Server error fetching event.' });
  }
};

// Create event (admin)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, category, event_date, capacity, image_url } = req.body;

    if (!title || !location || !event_date || !capacity) {
      return res.status(400).json({ message: 'Title, location, event date, and capacity are required.' });
    }

    const event = await Event.create({
      title,
      description,
      location,
      category: category || 'Other',
      event_date,
      capacity: parseInt(capacity),
      available_seats: parseInt(capacity),
      image_url,
      created_by_admin_id: req.user.id,
    });

    res.status(201).json({ message: 'Event created successfully.', event });
  } catch (error) {
    console.error('CreateEvent error:', error);
    res.status(500).json({ message: 'Server error creating event.' });
  }
};

// Update event (admin)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const { title, description, location, category, event_date, capacity, image_url } = req.body;

    // If capacity changed, adjust available_seats proportionally
    let newAvailableSeats = event.available_seats;
    if (capacity && parseInt(capacity) !== event.capacity) {
      const bookedSeats = event.capacity - event.available_seats;
      newAvailableSeats = Math.max(0, parseInt(capacity) - bookedSeats);
    }

    await event.update({
      title: title || event.title,
      description: description !== undefined ? description : event.description,
      location: location || event.location,
      category: category || event.category,
      event_date: event_date || event.event_date,
      capacity: capacity ? parseInt(capacity) : event.capacity,
      available_seats: newAvailableSeats,
      image_url: image_url !== undefined ? image_url : event.image_url,
    });

    res.json({ message: 'Event updated successfully.', event });
  } catch (error) {
    console.error('UpdateEvent error:', error);
    res.status(500).json({ message: 'Server error updating event.' });
  }
};

// Delete event (admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    await event.destroy();
    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('DeleteEvent error:', error);
    res.status(500).json({ message: 'Server error deleting event.' });
  }
};
