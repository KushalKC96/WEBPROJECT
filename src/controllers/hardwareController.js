import prisma from '../config/prisma.js';

// GET /api/hardware
export const getAllHardware = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, available } = req.query;

    const where = {};

    if (category) where.category = category;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (available === 'true') where.isAvailable = true;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const data = await prisma.hardware.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Get hardware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/hardware/:id
export const getHardwareById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid hardware ID' });
    }

    const data = await prisma.hardware.findUnique({
      where: { hardwareId: id },
    });

    if (!data) {
      return res.status(404).json({ success: false, message: 'Hardware not found' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get hardware by id error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
