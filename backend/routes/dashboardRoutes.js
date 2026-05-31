const express = require('express');
const router = express.Router();
const { getDashboardStats, getDashboardComplaints } = require('../controllers/dashboardController');
const { acceptComplaint, resolveComplaint } = require('../controllers/officerController');
const { protectOfficer } = require('../middleware/authMiddleware');

router.use(protectOfficer);

router.get('/stats', getDashboardStats);
router.get('/complaints', getDashboardComplaints);
router.patch('/accept/:id', acceptComplaint);
router.patch('/resolve/:id', resolveComplaint);

module.exports = router;
