const { District, Taluk, Village } = require('../models/AdminHierarchy');
const Department = require('../models/Department');

/**
 * UCRS AI Semantic & Location Resolution Engine
 */
const resolveComplaint = async (text) => {
  const lowercaseText = text.toLowerCase();
  
  // 1. Resolve Department
  const allDepts = await Department.find({});
  let predictedDept = allDepts.find(d => d.name.includes('Revenue')) || allDepts[0];
  let confidence = 0.5;

  for (const dept of allDepts) {
    for (const keyword of (dept.routingKeywords || [])) {
      if (lowercaseText.includes(keyword.toLowerCase())) {
        predictedDept = dept;
        confidence = 0.9;
        break;
      }
    }
  }

  // 2. Resolve Location Hierarchy (NLP + DB Lookup)
  let district = null;
  let taluk = null;
  let village = null;

  // Check Villages (highest granularity)
  const allVillages = await Village.find({}).populate('districtId talukId');
  for (const v of allVillages) {
    if (lowercaseText.includes(v.name.toLowerCase()) || 
        (v.name_ta && lowercaseText.includes(v.name_ta))) {
      village = v;
      taluk = v.talukId;
      district = v.districtId;
      break;
    }
  }

  // If village not found, check Taluks
  if (!taluk) {
    const allTaluks = await Taluk.find({}).populate('districtId');
    for (const t of allTaluks) {
      if (lowercaseText.includes(t.name.toLowerCase()) || 
          (t.name_ta && lowercaseText.includes(t.name_ta))) {
        taluk = t;
        district = t.districtId;
        break;
      }
    }
  }

  // If taluk not found, check Districts
  if (!district) {
    const allDistricts = await District.find({});
    for (const d of allDistricts) {
      if (lowercaseText.includes(d.name.toLowerCase())) {
        district = d;
        break;
      }
    }
  }

  return {
    department: predictedDept,
    district,
    taluk,
    village,
    confidence,
    severity: lowercaseText.includes('urgent') || lowercaseText.includes('danger') ? 'Critical' : 'Medium',
    aiGeneratedTitle: text.substring(0, 50) + '...'
  };
};

module.exports = { resolveComplaint };
