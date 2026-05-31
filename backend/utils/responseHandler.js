/**
 * Standardized API Response Handler
 */
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  });
};

const successResponse = (res, data, message = 'Success') => {
  return sendResponse(res, 200, true, message, data);
};

const errorResponse = (res, statusCode, message, error = null) => {
  return sendResponse(res, statusCode, false, message, null, error);
};

module.exports = {
  sendResponse,
  successResponse,
  errorResponse
};
