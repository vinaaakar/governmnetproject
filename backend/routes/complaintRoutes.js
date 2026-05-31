const express = require('express');
const router = express.Router();
const { submitComplaint, trackComplaint, getCitizenComplaints } = require('../controllers/complaintController');

router.post('/create', submitComplaint);
router.get('/my', getCitizenComplaints);
router.get('/track/:id', trackComplaint);

module.exports = router;
