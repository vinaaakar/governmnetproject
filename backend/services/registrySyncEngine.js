const Officer = require('../models/Officer');
const GovernmentOffice = require('../models/GovernmentOffice');
const { generateOfficerIdentity, OFFICE_TYPES } = require('../data/statewideOfficerRegistry');
const bcrypt = require('bcryptjs');

/**
 * Ensures that an office node exists and has a primary officer assigned.
 */
const synchronizeOfficeNode = async (district, taluk, department) => {
  try {
    const identity = generateOfficerIdentity(district, taluk, department);
    if (!identity) throw new Error(`Invalid department: ${department}`);

    // 1. Resolve or Create Government Office
    let office = await GovernmentOffice.findOne({ 
      district, 
      taluk, 
      department,
      officeCode: identity.officeCode 
    });

    if (!office) {
      console.log(`[SYNC] Registering New Node: ${identity.officeCode}`);
      office = new GovernmentOffice({
        officeName: `${department} ${OFFICE_TYPES.EXECUTIVE} - ${taluk}`,
        officeType: OFFICE_TYPES.EXECUTIVE,
        officeCode: identity.officeCode,
        district,
        taluk,
        department,
        address: `${taluk} Administrative Block, ${district}`,
        pincode: '600001', // Default or lookup
        activeOfficers: 1,
        complaintCapacity: 1000,
        telemetry: {
          panchayats: 15,
          regionalOffices: 5,
          slaHealth: '98.5%',
          latency: '12ms',
          load: '8%'
        }
      });
      await office.save();
    }

    // 2. Resolve or Create Primary Officer
    let officer = await Officer.findOne({ officialEmail: identity.email });

    if (!officer) {
      console.log(`[SYNC] Establishing Primary Officer for Node: ${identity.email}`);
      
      officer = new Officer({
        fullName: identity.fullName,
        officialEmail: identity.email,
        employeeId: identity.employeeId,
        password: identity.password, // Model handles hashing
        department,
        district,
        taluk,
        officeId: office._id,
        officeCode: identity.officeCode,
        clearanceLevel: identity.clearanceLevel,
        registryStatus: 'SYNCHRONIZED'
      });
      await officer.save();
    }

    return { office, officer };
  } catch (err) {
    console.error(`[SYNC_ERROR] Node ${district}-${taluk} synchronization failed:`, err.message);
    throw err;
  }
};

module.exports = {
  synchronizeOfficeNode
};
