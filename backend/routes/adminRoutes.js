const express = require('express');
const router = express.Router();
const { getDepartments, getDistricts, getTaluksByDistrict, getOffices } = require('../controllers/adminController');

router.get('/departments', getDepartments);
router.get('/districts', getDistricts);
router.get('/taluks/:districtId', getTaluksByDistrict);
router.get('/offices', getOffices);

module.exports = router;
