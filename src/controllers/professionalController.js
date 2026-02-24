import prisma from '../config/prisma.js';

// ─────────────────────────────────────────
// GET ALL PROFESSIONALS
// GET /api/professionals
// Public - anyone can view
// ─────────────────────────────────────────
export const getAllProfessionals = async (req, res) => {
  try {
    const professionals = await prisma.professional.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: professionals.length,
      data: professionals
    });
  } catch (error) {
    console.error('Get professionals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET SINGLE PROFESSIONAL
// GET /api/professionals/:id
// Public - anyone can view
// ─────────────────────────────────────────
export const getProfessionalById = async (req, res) => {
  try {
    const professional = await prisma.professional.findUnique({
      where: { professionalId: parseInt(req.params.id) }
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    res.status(200).json({ success: true, data: professional });
  } catch (error) {
    console.error('Get professional by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET PROFESSIONALS BY SKILL
// GET /api/professionals/skill/:skill
// Public - anyone can filter by skill
// ─────────────────────────────────────────
export const getProfessionalsBySkill = async (req, res) => {
  try {
    const professionals = await prisma.professional.findMany({
      where: {
        skill: {
          contains: req.params.skill  // partial match e.g. "plumb" matches "Plumbing"
        }
      },
      orderBy: { rating: 'desc' }     // highest rated first
    });

    res.status(200).json({
      success: true,
      count: professionals.length,
      data: professionals
    });
  } catch (error) {
    console.error('Get professionals by skill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// ADD NEW PROFESSIONAL
// POST /api/professionals
// Admin only
// ─────────────────────────────────────────
export const createProfessional = async (req, res) => {
  try {
    const { userId, skill, experienceYears, hourlyRate, bio, isAvailable } = req.body;

    // skill is required
    if (!skill) {
      return res.status(400).json({ success: false, message: 'Skill is required' });
    }

    const professional = await prisma.professional.create({
      data: {
        userId: userId ? parseInt(userId) : null,
        skill,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        bio: bio || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Professional added successfully',
      data: professional
    });
  } catch (error) {
    console.error('Create professional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// DELETE PROFESSIONAL
// DELETE /api/professionals/:id
// Admin only
// ─────────────────────────────────────────
export const deleteProfessional = async (req, res) => {
  try {
    const professional = await prisma.professional.findUnique({
      where: { professionalId: parseInt(req.params.id) }
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    await prisma.professional.delete({
      where: { professionalId: parseInt(req.params.id) }
    });

    res.status(200).json({ success: true, message: 'Professional deleted successfully' });
  } catch (error) {
    console.error('Delete professional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
