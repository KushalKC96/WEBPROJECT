import prisma from '../config/prisma.js';

// ============================================
// CREATE RENTAL BOOKING
// ============================================
export const createRental = async (req, res) => {
  try {
    const { hardwareId, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validation
    if (!hardwareId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hardwareId, startDate, and endDate'
      });
    }

    console.log('📦 Creating rental for user:', userId);

    // Check if hardware exists and is available
    const hardware = await prisma.hardware.findUnique({
      where: { hardwareId: parseInt(hardwareId) }
    });

    if (!hardware) {
      return res.status(404).json({
        success: false,
        message: 'Hardware not found'
      });
    }

    if (!hardware.isAvailable || hardware.stockQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Hardware is not available for rent'
      });
    }

    if (!hardware.rentalPricePerDay) {
      return res.status(400).json({
        success: false,
        message: 'This hardware is not available for rental'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Calculate rental days and total amount
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = parseFloat(hardware.rentalPricePerDay) * days;

    console.log(`💰 Rental: ${days} days × NPR ${hardware.rentalPricePerDay} = NPR ${totalAmount}`);

    // Create rental
    const rental = await prisma.rental.create({
      data: {
        userId,
        hardwareId: parseInt(hardwareId),
        startDate: start,
        endDate: end,
        totalAmount,
        status: 'active'
      },
      include: {
        hardware: {
          select: {
            name: true,
            category: true,
            rentalPricePerDay: true,
            imageUrl: true
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

    // Decrease stock quantity
    await prisma.hardware.update({
      where: { hardwareId: parseInt(hardwareId) },
      data: {
        stockQuantity: hardware.stockQuantity - 1,
        isAvailable: hardware.stockQuantity - 1 > 0
      }
    });

    console.log('✅ Rental created:', rental.rentalId);

    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: rental
    });

  } catch (error) {
    console.error('❌ Create rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating rental'
    });
  }
};

// ============================================
// GET USER'S RENTALS
// ============================================
export const getUserRentals = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own rentals or is admin
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('📋 Fetching rentals for user:', userId);

    const rentals = await prisma.rental.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        hardware: {
          select: {
            name: true,
            category: true,
            rentalPricePerDay: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${rentals.length} rentals`);

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });

  } catch (error) {
    console.error('❌ Get user rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET ALL RENTALS (Admin Only)
// ============================================
export const getAllRentals = async (req, res) => {
  try {
    const { status } = req.query;

    console.log('📋 Fetching all rentals');

    const where = {};
    if (status) {
      where.status = status;
    }

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        hardware: {
          select: {
            name: true,
            category: true,
            rentalPricePerDay: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${rentals.length} rentals`);

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });

  } catch (error) {
    console.error('❌ Get all rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET SINGLE RENTAL
// ============================================
export const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Fetching rental:', id);

    const rental = await prisma.rental.findUnique({
      where: {
        rentalId: parseInt(id)
      },
      include: {
        hardware: true,
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

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check if user owns this rental or is admin
    if (rental.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: rental
    });

  } catch (error) {
    console.error('❌ Get rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// MARK RENTAL AS RETURNED
// ============================================
export const returnRental = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔄 Processing return for rental:', id);

    // Get rental details
    const rental = await prisma.rental.findUnique({
      where: { rentalId: parseInt(id) },
      include: { hardware: true }
    });

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check if user owns this rental or is admin
    if (rental.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (rental.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Rental already returned'
      });
    }

    // Update rental status
    const updatedRental = await prisma.rental.update({
      where: { rentalId: parseInt(id) },
      data: {
        status: 'returned',
        returnDate: new Date()
      }
    });

    // Increase stock quantity
    await prisma.hardware.update({
      where: { hardwareId: rental.hardwareId },
      data: {
        stockQuantity: rental.hardware.stockQuantity + 1,
        isAvailable: true
      }
    });

    console.log('✅ Rental returned successfully');

    res.status(200).json({
      success: true,
      message: 'Rental marked as returned',
      data: updatedRental
    });

  } catch (error) {
    console.error('❌ Return rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// UPDATE RENTAL STATUS (Admin Only)
// ============================================
export const updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'returned', 'cancelled', 'overdue'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    console.log(`📝 Updating rental ${id} status to: ${status}`);

    const rental = await prisma.rental.update({
      where: { rentalId: parseInt(id) },
      data: { status }
    });

    res.status(200).json({
      success: true,
      message: 'Rental status updated',
      data: rental
    });

  } catch (error) {
    console.error('❌ Update rental status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};