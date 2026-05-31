const { District, Taluk, Village } = require('../models/AdminHierarchy');
const Department = require('../models/Department');
const GovernmentOffice = require('../models/GovernmentOffice');

const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find({});
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments' });
  }
};

const getDistricts = async (req, res) => {
  try {
    const districts = await District.find({});
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching districts' });
  }
};

const getTaluksByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;
    const taluks = await Taluk.find({ districtId });
    res.json(taluks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching taluks' });
  }
};

const getOffices = async (req, res) => {
  try {
    const { departmentId, districtId, talukId } = req.query;
    const query = { departmentId, districtId };
    if (talukId) query.talukId = talukId;
    
    const offices = await GovernmentOffice.find(query);
    res.json(offices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offices' });
  }
};

module.exports = { getDepartments, getDistricts, getTaluksByDistrict, getOffices };
