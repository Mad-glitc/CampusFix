import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'IT & Smart Classrooms', slug: 'it_av', icon: 'Cpu', defaultSlaHours: 12, description: 'Projectors, smartboards, audio visual equipment, lab PCs' },
  { name: 'Electrical & Lighting', slug: 'electrical', icon: 'Zap', defaultSlaHours: 8, description: 'Power sockets, ceiling fans, corridor lighting, switchboards' },
  { name: 'Plumbing & Sanitation', slug: 'plumbing', icon: 'Droplet', defaultSlaHours: 6, description: 'Restroom pipes, taps, water coolers, drainage' },
  { name: 'Civil & Furniture', slug: 'furniture', icon: 'Hammer', defaultSlaHours: 48, description: 'Benches, whiteboards, door locks, window glass' },
  { name: 'HVAC & Air Conditioning', slug: 'hvac', icon: 'Wind', defaultSlaHours: 24, description: 'Lecture hall AC units, ventilation ducts, temperature controls' },
];

/**
 * @desc    Get all active categories (auto-seeds defaults if empty)
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Auto-seed defaults if database collection is empty
    if (categories.length === 0) {
      categories = await Category.insertMany(DEFAULT_CATEGORIES);
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    // Graceful fallback with static defaults if DB is temporarily offline
    res.status(200).json({
      success: true,
      count: DEFAULT_CATEGORIES.length,
      categories: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, _id: `cat_${i + 1}` })),
    });
  }
};

/**
 * @desc    Create a new issue category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, defaultSlaHours } = req.body;
    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      description: description || '',
      icon: icon || 'Wrench',
      defaultSlaHours: Number(defaultSlaHours) || 24,
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};
