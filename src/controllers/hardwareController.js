import prisma from '../config/prisma.js';

// GET ALL HARDWARE
export const getAllHardware = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, available } = req.query;

    const where = {};

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (available === 'true') where.isAvailable = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const hardware = await prisma.hardware.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: hardware.length,
      data: hardware
    });
  } catch (error) {
    console.error('Get hardware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET SINGLE HARDWARE
export const getHardwareById = async (req, res) => {
  try {
    const hardware = await prisma.hardware.findUnique({
      where: { hardwareId: parseInt(req.params.id) }
    });

    if (!hardware) {
      return res.status(404).json({ success: false, message: 'Hardware not found' });
    }

    res.status(200).json({ success: true, data: hardware });
  } catch (error) {
    console.error('Get hardware by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CREATE HARDWARE
export const createHardware = async (req, res) => {
  try {
    const { name, category, description, price, rentalPricePerDay, stockQuantity, imageUrl } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
    }

    const hardware = await prisma.hardware.create({
      data: {
        name,
        category,
        description: description || null,
        price: parseFloat(price),
        rentalPricePerDay: rentalPricePerDay ? parseFloat(rentalPricePerDay) : null,
        stockQuantity: stockQuantity || 0,
        imageUrl: imageUrl || null
      }
    });

    res.status(201).json({ success: true, message: 'Hardware created', data: hardware });
  } catch (error) {
    console.error('Create hardware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE HARDWARE
export const updateHardware = async (req, res) => {
  try {
    const updateData = req.body;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.rentalPricePerDay) updateData.rentalPricePerDay = parseFloat(updateData.rentalPricePerDay);

    const hardware = await prisma.hardware.update({
      where: { hardwareId: parseInt(req.params.id) },
      data: updateData
    });

    res.status(200).json({ success: true, message: 'Hardware updated', data: hardware });
  } catch (error) {
    console.error('Update hardware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE HARDWARE
export const deleteHardware = async (req, res) => {
  try {
    await prisma.hardware.delete({
      where: { hardwareId: parseInt(req.params.id) }
    });

    res.status(200).json({ success: true, message: 'Hardware deleted' });
  } catch (error) {
    console.error('Delete hardware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};