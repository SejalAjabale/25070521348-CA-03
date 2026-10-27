const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { optionalAuth, verifyToken, requireRole } = require('../middleware/auth');

// Pricing dictionary for packages
const PACKAGE_PRICES = {
  'Express Wash': 30,
  'Ceramic Detail Wash': 65,
  'Interior & Exterior Deep Spa': 120,
  'Paint Correction & Ultra Coat': 220
};

// @route   POST /api/bookings
// @desc    Create a new appointment booking
// @access  Public (attaches authenticated user if logged in)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, carModel, serviceType, date, timeSlot, notes } = req.body;

    if (!name || !email || !phone || !carModel || !date || !timeSlot) {
      return res.status(400).json({ message: 'All booking fields are required.' });
    }

    const price = PACKAGE_PRICES[serviceType] || 65;

    const bookingData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      carModel: carModel.trim(),
      serviceType: serviceType || 'Ceramic Detail Wash',
      date,
      timeSlot,
      notes: notes ? notes.trim() : '',
      price,
      status: 'Pending',
      userId: req.user ? req.user._id : null
    };

    const newBooking = new Booking(bookingData);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: err.message || 'Failed to create booking' });
  }
});

// @route   GET /api/bookings
// @desc    Get bookings (filterable by user role, status, search)
// @access  Public / Optional Auth
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, search, email } = req.query;
    let query = {};

    // Role-based visibility
    if (req.user) {
      if (req.user.role === 'customer') {
        // Customers see their own bookings (matching userId or registered email)
        query.$or = [
          { userId: req.user._id },
          { email: req.user.email.toLowerCase() }
        ];
      }
      // staff and admin see all bookings
    } else if (email) {
      // Unauthenticated query by guest email
      query.email = email.toLowerCase().trim();
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Search filter across name, carModel, serviceType, or phone
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchCriteria = [
        { name: searchRegex },
        { carModel: searchRegex },
        { serviceType: searchRegex },
        { phone: searchRegex }
      ];

      if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            { $or: searchCriteria }
          ]
        };
      } else {
        query.$or = searchCriteria;
      }
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch bookings' });
  }
});

// @route   GET /api/bookings/stats
// @desc    Get dashboard metrics & summary
// @access  Public / Auth
router.get('/stats', optionalAuth, async (req, res) => {
  try {
    let baseQuery = {};
    if (req.user && req.user.role === 'customer') {
      baseQuery.$or = [
        { userId: req.user._id },
        { email: req.user.email.toLowerCase() }
      ];
    }

    const total = await Booking.countDocuments(baseQuery);
    const pending = await Booking.countDocuments({ ...baseQuery, status: 'Pending' });
    const inProgress = await Booking.countDocuments({ ...baseQuery, status: 'In Progress' });
    const completed = await Booking.countDocuments({ ...baseQuery, status: 'Completed' });
    const cancelled = await Booking.countDocuments({ ...baseQuery, status: 'Cancelled' });

    // Calculate total revenue for completed bookings
    const completedBookings = await Booking.find({ ...baseQuery, status: 'Completed' }).select('price');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    res.status(200).json({
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      totalRevenue
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Failed to compute statistics' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status (Pending -> In Progress -> Completed / Cancelled)
// @access  Public / Authenticated
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel or delete an appointment
// @access  Public / Authenticated
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.status(200).json({ message: 'Booking successfully removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;