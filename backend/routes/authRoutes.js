const express = require('express');
const router = express.Router();
const { 
  officerLogin, 
  refreshToken, 
  officerLogout, 
  getOfficerProfile 
} = require('../controllers/authController');
const { protectOfficer } = require('../middleware/authMiddleware');

router.post('/officer-login', officerLogin);
router.post('/officer-refresh', refreshToken);
router.post('/officer-logout', protectOfficer, officerLogout);
router.get('/officer-profile', protectOfficer, getOfficerProfile);

module.exports = router;
