import LostFoundItem from '../models/LostFoundItem.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @desc    Get all lost and found items with search & filters
 * @route   GET /api/lost-found
 * @access  Private (All authenticated roles)
 */
export const getLostFoundItems = async (req, res, next) => {
  try {
    const { type, status, category, search, building } = req.query;

    const query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (building && building !== 'all') {
      query['location.building'] = { $regex: building, $options: 'i' };
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { 'location.building': regex },
        { 'location.specificSpot': regex },
        { 'contact.name': regex },
        { 'contact.handoverLocation': regex },
      ];
    }

    const items = await LostFoundItem.find(query)
      .populate('reportedBy', 'name email department role avatar')
      .populate('claimedBy', 'name email department')
      .sort({ createdAt: -1 });

    // Aggregate summary stats for the dashboard header
    const [totalItems, openLostCount, openFoundCount, claimedCount] = await Promise.all([
      LostFoundItem.countDocuments(),
      LostFoundItem.countDocuments({ type: 'lost', status: 'open' }),
      LostFoundItem.countDocuments({ type: 'found', status: 'open' }),
      LostFoundItem.countDocuments({ status: 'claimed' }),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      stats: {
        totalItems,
        openLostCount,
        openFoundCount,
        claimedCount,
      },
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single lost or found item by ID
 * @route   GET /api/lost-found/:id
 * @access  Private
 */
export const getLostFoundItemById = async (req, res, next) => {
  try {
    const item = await LostFoundItem.findById(req.params.id)
      .populate('reportedBy', 'name email department role avatar phoneNumber')
      .populate('claimedBy', 'name email department');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new lost or found item listing
 * @route   POST /api/lost-found
 * @access  Private (All authenticated roles)
 */
export const createLostFoundItem = async (req, res, next) => {
  try {
    const {
      type,
      title,
      category,
      description,
      building,
      specificSpot,
      itemDate,
      contactName,
      contactPhone,
      contactEmail,
      handoverLocation,
    } = req.body;

    if (!type || !['lost', 'found'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Please specify whether item is "lost" or "found"',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a descriptive item title',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item details and description',
      });
    }

    if (!building || !building.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the campus building or area',
      });
    }

    if (!contactPhone || !contactPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contact phone number',
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newItem = await LostFoundItem.create({
      type,
      title: title.trim(),
      category: category || 'Other',
      description: description.trim(),
      location: {
        building: building.trim(),
        specificSpot: (specificSpot || '').trim(),
      },
      itemDate: itemDate ? new Date(itemDate) : new Date(),
      imageUrl,
      contact: {
        name: (contactName || req.user.name || '').trim(),
        phone: contactPhone.trim(),
        email: (contactEmail || req.user.email || '').trim(),
        handoverLocation: (handoverLocation || '').trim(),
      },
      status: 'open',
      reportedBy: req.user._id,
    });

    const populatedItem = await LostFoundItem.findById(newItem._id)
      .populate('reportedBy', 'name email department role avatar');

    // Notify admins if high-value item was reported found
    if (type === 'found') {
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          title: `New Found Item Reported: ${newItem.title}`,
          message: `${req.user.name} reported a found item at ${newItem.location.building}. Contact: ${newItem.contact.phone}`,
          type: 'announcement',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost item notice' : 'Found item record'} published successfully!`,
      item: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item status (e.g. mark as claimed or reopen)
 * @route   PATCH /api/lost-found/:id/status
 * @access  Private (Owner or Admin)
 */
export const updateLostFoundStatus = async (req, res, next) => {
  try {
    const { status, resolutionRemarks } = req.body;

    if (!['open', 'claimed', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "open", "claimed", or "closed"',
      });
    }

    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    // Permission check: item reporter or admin can change status
    const isOwner = String(item.reportedBy) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the user who posted this item or an administrator can update its status.',
      });
    }

    item.status = status;
    if (status === 'claimed') {
      item.claimedBy = req.user._id;
      item.claimedAt = new Date();
      item.resolutionRemarks = (resolutionRemarks || 'Item successfully claimed and reunited with owner.').trim();
    } else if (status === 'open') {
      item.claimedBy = null;
      item.claimedAt = null;
      item.resolutionRemarks = '';
    }

    await item.save();

    const populatedItem = await LostFoundItem.findById(item._id)
      .populate('reportedBy', 'name email department role avatar')
      .populate('claimedBy', 'name email department');

    res.status(200).json({
      success: true,
      message: status === 'claimed' ? 'Item marked as successfully recovered / claimed!' : 'Item status reopened.',
      item: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lost/found listing
 * @route   DELETE /api/lost-found/:id
 * @access  Private (Owner or Admin)
 */
export const deleteLostFoundItem = async (req, res, next) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    const isOwner = String(item.reportedBy) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this listing.',
      });
    }

    await LostFoundItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
