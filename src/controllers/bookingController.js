import prisma from '../config/prisma.js';

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
        },
        payment: true
      }
    });

    if (!booking) {
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
  }
};
