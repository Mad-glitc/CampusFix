import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phoneNumber, accessCode, registrationNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const targetRole = role === 'admin' ? 'admin' : (role === 'staff' ? 'staff' : 'student');
    const providedCode = (accessCode || registrationNumber || '').toString().trim();

    // Verify role-based security access codes
    const STAFF_KEY = (process.env.STAFF_ACCESS_KEY || 'STAFF2026').trim();
    const ADMIN_KEY = (process.env.ADMIN_ACCESS_KEY || 'ADMIN2026').trim();

    if (targetRole === 'admin') {
      if (!providedCode) {
        return res.status(400).json({
          success: false,
          message: 'Administrator master access key is required to register as admin',
        });
      }
      if (providedCode !== ADMIN_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid administrator access key. You are not authorized to create an administrator account.',
        });
      }
    } else if (targetRole === 'staff') {
      if (!providedCode) {
        return res.status(400).json({
          success: false,
          message: 'Technical staff security access key is required to register as staff',
        });
      }
      if (providedCode !== STAFF_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid technical staff access key. Only authorized technicians may register under this role.',
        });
      }
    } else {
      // Student role requires student registration number
      if (!providedCode) {
        return res.status(400).json({
          success: false,
          message: 'Student registration number is required',
        });
      }
      if (providedCode.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Student registration number must be at least 3 characters',
        });
      }
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: targetRole,
      department: department || 'General',
      phoneNumber: phoneNumber || '',
      registrationNumber: targetRole === 'student' ? providedCode : '',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phoneNumber: user.phoneNumber,
        registrationNumber: user.registrationNumber,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ') || 'Validation error during registration',
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email, selecting password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Compare bcrypt password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact campus admin.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phoneNumber: user.phoneNumber,
        registrationNumber: user.registrationNumber,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ') || 'Validation error during registration',
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        phoneNumber: req.user.phoneNumber,
        registrationNumber: req.user.registrationNumber,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ') || 'Validation error during registration',
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phoneNumber, department, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phoneNumber: user.phoneNumber,
        registrationNumber: user.registrationNumber,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ') || 'Validation error during registration',
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
};
