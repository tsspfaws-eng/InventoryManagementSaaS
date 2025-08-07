const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');
const { authenticate } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/auth/register-tenant
 * @desc    Register a new tenant and admin user
 * @access  Public
 */
router.post(
  '/register-tenant',
  [
    // Tenant validation
    body('tenant.name').notEmpty().withMessage('Tenant name is required'),
    body('tenant.companyName').notEmpty().withMessage('Company name is required'),
    body('tenant.email').isEmail().withMessage('Please include a valid email'),
    
    // User validation
    body('user.firstName').notEmpty().withMessage('First name is required'),
    body('user.lastName').notEmpty().withMessage('Last name is required'),
    body('user.email').isEmail().withMessage('Please include a valid email'),
    body('user.password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenant: tenantData, user: userData } = req.body;

      // Check if tenant email already exists
      const existingTenant = await Tenant.findOne({ email: tenantData.email });
      if (existingTenant) {
        throw ApiError.conflict('Tenant with this email already exists');
      }

      // Check if user email already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
      }

      // Create new tenant
      const tenant = new Tenant({
        ...tenantData,
        subscriptionStatus: 'trial',
        isActive: true
      });

      await tenant.save();

      // Create admin user for the tenant
      const user = new User({
        ...userData,
        tenantId: tenant._id,
        role: 'admin',
        isActive: true
      });

      await user.save();

      // Generate auth token
      const token = await user.generateAuthToken();

      res.status(201).json({
        success: true,
        data: {
          tenant: tenant.toObject(),
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
    body('tenantId').exists().withMessage('Tenant ID is required')
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, tenantId } = req.body;

      // Check if tenant exists and is active
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        throw ApiError.notFound('Tenant not found');
      }

      if (!tenant.isActive) {
        throw ApiError.forbidden('Tenant account is inactive or suspended');
      }

      // Check if subscription is active
      if (!tenant.isSubscriptionActive) {
        throw ApiError.forbidden('Tenant subscription has expired');
      }

      // Find user by credentials
      const user = await User.findByCredentials(email, password, tenantId);

      // Generate auth token
      const token = await user.generateAuthToken();

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          token,
          tenant: {
            _id: tenant._id,
            name: tenant.name,
            companyName: tenant.companyName,
            subscriptionPlan: tenant.subscriptionPlan,
            settings: tenant.settings
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear token
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // Remove the current token
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, async (req, res, next) => {
  try {
    // Remove all tokens
    req.user.tokens = [];
    await req.user.save();

    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('tenantId').exists().withMessage('Tenant ID is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, tenantId } = req.body;

      // Find user
      const user = await User.findOne({ email, tenantId });
      if (!user) {
        // Don't reveal that the user doesn't exist
        return res.json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link'
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Save token to user
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // TODO: Send email with reset link
      // For now, just return the token in the response (for development)
      res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
        // Remove this in production
        resetToken
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token').exists().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        throw ApiError.badRequest('Invalid or expired token');
      }

      // Find user by token
      const user = await User.findOne({
        _id: decoded.userId,
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw ApiError.badRequest('Invalid or expired token');
      }

      // Update password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  '/change-password',
  [
    authenticate,
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw ApiError.badRequest('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;