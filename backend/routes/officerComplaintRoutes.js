const express = require('express');
const router = express.Router();
const { updateComplaintStatus } = require('../controllers/officerController');
const { protectOfficer } = require('../middleware/authMiddleware');

router.patch('/:id/status', protectOfficer, updateComplaintStatus);

module.exports = router;
