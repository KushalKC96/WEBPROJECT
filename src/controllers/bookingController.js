import prisma from '../config/prisma.js';

<<<<<<< HEAD
// ============================================
// CREATE BOOKING (Book a Professional)
// ============================================
export const createBooking = async (req, res) => {
  try {
    const { professionalId, bookingDate, serviceHours, notes } = req.body;
    const userId = req.user.id;

    // Validation
    if (!professionalId || !bookingDate || !serviceHours) {
      return res.status(400).json({
        success: false,
        message: 'Please provide professionalId, bookingDate, and serviceHours'
      });
    }

    if (parseInt(serviceHours) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'serviceHours must be greater than 0'
      });
    }

    console.log('📅 Creating booking for user:', userId);

    // Check if professional exists and is available
    const professional = await prisma.professional.findUnique({
      where: { professionalId: parseInt(professionalId) }
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    if (!professional.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This professional is not available for booking'
      });
    }

    // Validate booking date is not in the past
    const date = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Booking date cannot be in the past'
      });
    }

    // Calculate total amount
    const totalAmount = professional.hourlyRate
      ? parseFloat(professional.hourlyRate) * parseInt(serviceHours)
      : null;

    console.log(`💰 Booking: ${serviceHours} hrs × NPR ${professional.hourlyRate} = NPR ${totalAmount}`);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        professionalId: parseInt(professionalId),
        bookingDate: date,
        serviceHours: parseInt(serviceHours),
        totalAmount,
        status: 'pending',
        notes: notes || null
      },
      include: {
        professional: {
          select: {
            skill: true,
            hourlyRate: true,
            rating: true,
            experienceYears: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    console.log('✅ Booking created:', booking.bookingId);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating booking'
    });
  }
};

// ============================================
// GET USER'S BOOKINGS
// ============================================
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to see their own bookings (or admin sees all)
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('📋 Fetching bookings for user:', userId);

    const bookings = await prisma.booking.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        professional: {
          select: {
            skill: true,
            hourlyRate: true,
            rating: true,
            experienceYears: true,
            bio: true
          }
        },
        payment: {
          select: {
            amount: true,
            method: true,
            status: true,
            paymentDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${bookings.length} bookings`);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('❌ Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET ALL BOOKINGS (Admin Only)
// ============================================
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;

    console.log('📋 Fetching all bookings');

    const where = {};
    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        professional: {
          select: {
            skill: true,
            hourlyRate: true,
            rating: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        payment: {
          select: {
            amount: true,
            method: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${bookings.length} bookings`);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// UPDATE BOOKING STATUS
// ============================================
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    console.log(`📝 Updating booking ${id} status to: ${status}`);

    // Check booking exists
    const existing = await prisma.booking.findUnique({
      where: { bookingId: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = await prisma.booking.update({
      where: { bookingId: parseInt(id) },
      data: { status },
      include: {
        professional: {
          select: { skill: true, hourlyRate: true }
        },
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log('✅ Booking status updated');

    res.status(200).json({
      success: true,
      message: `Booking status updated to "${status}"`,
      data: booking
    });

  } catch (error) {
    console.error('❌ Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET SINGLE BOOKING
// ============================================
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Fetching booking:', id);

    const booking = await prisma.booking.findUnique({
      where: { bookingId: parseInt(id) },
      include: {
        professional: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
=======
const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const canReadBooking = (user, booking) => {
  if (!user || !booking) return false;
  if (user.role === 'admin') return true;
  if (user.id === booking.userId) return true;
  return booking.professional?.userId === user.id;
};

// GET /api/bookings
// Admin only
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        professional: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const bookingId = parseNumber(req.params.id);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        professional: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } }
>>>>>>> ea100e653a6180d720fc96e391acbc22ade5b8b5
        },
        payment: true
      }
    });

    if (!booking) {
<<<<<<< HEAD
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only the booking owner or admin can view it
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// CANCEL BOOKING (User)
// ============================================
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('❌ Cancelling booking:', id);

    const booking = await prisma.booking.findUnique({
      where: { bookingId: parseInt(id) }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only owner or admin can cancel
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    const updated = await prisma.booking.update({
      where: { bookingId: parseInt(id) },
      data: { status: 'cancelled' }
    });

    console.log('✅ Booking cancelled');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updated
    });

  } catch (error) {
    console.error('❌ Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
=======
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canReadBooking(req.user, booking)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/user/:userId
export const getUserBookings = async (req, res) => {
  try {
    const userId = parseNumber(req.params.userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        professional: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('getUserBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/bookings
// User booking request to hire a professional
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { professionalId, bookingDate, serviceHours, notes } = req.body;

    const parsedProfessionalId = parseNumber(professionalId);
    const parsedServiceHours = parseNumber(serviceHours);

    if (!parsedProfessionalId || !bookingDate || !parsedServiceHours || parsedServiceHours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'professionalId, bookingDate and positive serviceHours are required'
      });
    }

    const professional = await prisma.professional.findUnique({
      where: { professionalId: parsedProfessionalId },
      include: { user: { select: { id: true } } }
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    if (!professional.userId) {
      return res.status(400).json({
        success: false,
        message: 'This professional profile is not linked to an account yet'
      });
    }

    if (!professional.isAvailable) {
      return res.status(400).json({ success: false, message: 'Professional is not available right now' });
    }

    const hourlyRate = Number(professional.hourlyRate || 0);
    const totalAmount = Number((hourlyRate * parsedServiceHours).toFixed(2));

    const created = await prisma.booking.create({
      data: {
        userId,
        professionalId: parsedProfessionalId,
        bookingDate: new Date(bookingDate),
        serviceHours: parsedServiceHours,
        totalAmount,
        notes: notes || null,
        status: 'pending'
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        professional: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Booking created successfully', data: created });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = parseNumber(req.params.id);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const existing = await prisma.booking.findUnique({ where: { bookingId } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && req.user.id !== existing.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (existing.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const updated = await prisma.booking.update({
      where: { bookingId },
      data: { status: 'cancelled' }
    });

    res.status(200).json({ success: true, message: 'Booking cancelled', data: updated });
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/bookings/:id/status
// Professional (owner) or admin can update status
export const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = parseNumber(req.params.id);
    const { status } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { professional: { select: { userId: true } } }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwnerProfessional = booking.professional?.userId === req.user.id;
    if (req.user.role !== 'admin' && !isOwnerProfessional) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = await prisma.booking.update({
      where: { bookingId },
      data: { status }
    });

    res.status(200).json({ success: true, message: 'Booking status updated', data: updated });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
>>>>>>> ea100e653a6180d720fc96e391acbc22ade5b8b5
  }
};
