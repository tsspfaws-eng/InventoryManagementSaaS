const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');

/**
 * Middleware to authenticate users using JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw ApiError.unauthorized('Authentication token is required');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id and token
    const user = await User.findOne({ 
      _id: decoded.userId,
      'tokens.token': token 
    });
    
    if (!user) {
      throw ApiError.unauthorized('User not found or token is invalid');
    }
    
    // Add user and token to request object
    req.user = user;
    req.token = token;
    req.tenantId = user.tenantId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Token has expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check if user has required role
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`User role ${req.user.role} is not authorized to access this resource`));
    }
    
    next();
  };
};

/**
 * Middleware to validate tenant access
 */
const validateTenant = async (req, res, next) => {
  try {
    if (!req.tenantId) {
      throw ApiError.badRequest('Tenant ID is required');
    }
    
    const tenant = await Tenant.findById(req.tenantId);
    
    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
    }
    
    if (!tenant.isActive) {
      throw ApiError.forbidden('Tenant account is inactive or suspended');
    }
    
    // Add tenant to request object
    req.tenant = tenant;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  validateTenant
};