const jwt = require('jsonwebtoken');
const Officer = require('../models/Officer');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Protect Officer Routes
 */
const protectOfficer = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ucrs_secret_key_2026');

      req.officer = await Officer.findById(decoded.id).select('-password');
      if (!req.officer || !req.officer.activeStatus) {
        return errorResponse(res, 401, 'Officer registry validation failed.');
      }
      next();
    } catch (error) {
      console.error('[AUTH_MIDDLEWARE_ERROR]', error);
      return errorResponse(res, 401, 'Secure access token expired. Reauthentication required.');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Regional gateway rejected authentication request.');
  }
};

/**
 * Authorize specific roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.officer || !roles.includes(req.officer.role)) {
      return errorResponse(res, 403, 'Officer does not possess required clearance level.');
    }
    next();
  };
};

/**
 * Authorize by minimum clearance level
 */
const authorizeClearance = (minLevel) => {
  return (req, res, next) => {
    // Standardizing on 1-5 Scale
    // 1: Village, 2: Taluk, 3: District, 4: Regional, 5: State
    if (!req.officer || req.officer.clearanceLevel < minLevel) {
      return errorResponse(res, 403, 'CLEARANCE DENIED: Higher administrative privilege required.', 'ERR-AUTH-CLEARANCE');
    }
    next();
  };
};

module.exports = {
  protectOfficer,
  authorizeRoles,
  authorizeClearance
};
