import prisma from '../config/prisma.js';

// ============================================
// CREATE PAYMENT
// ============================================
export const createPayment = async (req, res) => {
  try {
    const { amount, method, bookingId, rentalId, transactionId } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount'
      });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const validMethods = ['cash', 'esewa', 'khalti', 'bank_transfer', 'card'];
    if (method && !validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Payment method must be one of: ${validMethods.join(', ')}`
      });
    }

    // Must be linked to either a booking or rental
    if (!bookingId && !rentalId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either bookingId or rentalId'
      });
    }

    console.log('💳 Creating payment for user:', userId);

    // Verify booking belongs to user
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { bookingId: parseInt(bookingId) }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: this booking does not belong to you'
        });
      }

      if (booking.paymentId) {
        return res.status(400).json({
          success: false,
          message: 'This booking already has a payment'
        });
      }
    }

    // Verify rental belongs to user
    if (rentalId) {
      const rental = await prisma.rental.findUnique({
        where: { rentalId: parseInt(rentalId) }
      });

      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      if (rental.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: this rental does not belong to you'
        });
      }

      if (rental.paymentId) {
        return res.status(400).json({
          success: false,
          message: 'This rental already has a payment'
        });
      }
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        method: method || 'cash',
        status: 'completed',
        transactionId: transactionId || null
      }
    });

    console.log('✅ Payment created:', payment.paymentId);

    // Link payment to booking
    if (bookingId) {
      await prisma.booking.update({
        where: { bookingId: parseInt(bookingId) },
        data: {
          paymentId: payment.paymentId,
          status: 'confirmed'
        }
      });
      console.log('🔗 Linked payment to booking:', bookingId);
    }

    // Link payment to rental
    if (rentalId) {
      await prisma.rental.update({
        where: { rentalId: parseInt(rentalId) },
        data: { paymentId: payment.paymentId }
      });
      console.log('🔗 Linked payment to rental:', rentalId);
    }

    // Return payment with linked data
    const fullPayment = await prisma.payment.findUnique({
      where: { paymentId: payment.paymentId },
      include: {
        user: {
          select: { name: true, email: true }
        },
        bookings: {
          select: {
            bookingId: true,
            bookingDate: true,
            serviceHours: true,
            status: true,
            professional: {
              select: { skill: true, hourlyRate: true }
            }
          }
        },
        rentals: {
          select: {
            rentalId: true,
            startDate: true,
            endDate: true,
            status: true,
            hardware: {
              select: { name: true, category: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: fullPayment
    });

  } catch (error) {
    console.error('❌ Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment'
    });
  }
};

// ============================================
// GET PAYMENT BY ID
// ============================================
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Fetching payment:', id);

    const payment = await prisma.payment.findUnique({
      where: { paymentId: parseInt(id) },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        bookings: {
          select: {
            bookingId: true,
            bookingDate: true,
            serviceHours: true,
            totalAmount: true,
            status: true,
            notes: true,
            professional: {
              select: { skill: true, hourlyRate: true, rating: true }
            }
          }
        },
        rentals: {
          select: {
            rentalId: true,
            startDate: true,
            endDate: true,
            returnDate: true,
            totalAmount: true,
            status: true,
            hardware: {
              select: { name: true, category: true, rentalPricePerDay: true }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Only owner or admin can view payment
    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('❌ Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET USER'S PAYMENTS (own history)
// ============================================
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📋 Fetching payments for user:', userId);

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        bookings: {
          select: {
            bookingId: true,
            bookingDate: true,
            status: true,
            professional: {
              select: { skill: true }
            }
          }
        },
        rentals: {
          select: {
            rentalId: true,
            startDate: true,
            endDate: true,
            status: true,
            hardware: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });

    console.log(`✅ Found ${payments.length} payments`);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    console.error('❌ Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET ALL PAYMENTS (Admin Only)
// ============================================
export const getAllPayments = async (req, res) => {
  try {
    const { status, method } = req.query;

    console.log('📋 Fetching all payments');

    const where = {};
    if (status) where.status = status;
    if (method) where.method = method;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        bookings: {
          select: {
            bookingId: true,
            status: true,
            professional: { select: { skill: true } }
          }
        },
        rentals: {
          select: {
            rentalId: true,
            status: true,
            hardware: { select: { name: true } }
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    console.log(`✅ Found ${payments.length} payments | Total: NPR ${totalRevenue}`);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalRevenue,
      data: payments
    });

  } catch (error) {
    console.error('❌ Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
