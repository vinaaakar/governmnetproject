const { District, Taluk } = require('../models/AdminHierarchy');
const GovernmentOffice = require('../models/GovernmentOffice');
const Officer = require('../models/Officer');
const { DISTRICT_REGISTRY } = require('../data/statewideOfficerRegistry');
const { synchronizeOfficeNode } = require('./registrySyncEngine');

/**
 * Statewide Infrastructure Sync
 * Populates ALL districts, taluks, and administrative nodes for the entire state.
 */
const seedStateInfrastructure = async () => {
  try {
    console.log('[SEED] Initiating Statewide Infrastructure Sync...');

    // 1. Clear Existing Registry (Fresh Start for Stabilization)
    // We keep STATE_ADMIN users if any exist, but clear regular officers
    await District.deleteMany({});
    await Taluk.deleteMany({});
    await GovernmentOffice.deleteMany({});
    await Officer.deleteMany({ role: { $ne: 'STATE_ADMIN' } });
    
    console.log('[SEED] Registry Purged. Beginning Reconstruction...');

    const districtNames = Object.keys(DISTRICT_REGISTRY);
    
    for (const districtName of districtNames) {
      console.log(`[SEED] Synchronizing District: ${districtName}`);
      
      // Resolve or Create District
      let district = await District.findOne({ name: districtName });
      if (!district) {
        district = new District({
          name: districtName,
          code: districtName.toUpperCase(),
          region: 'North', 
          status: 'ONLINE'
        });
        await district.save();
      }

      const taluks = DISTRICT_REGISTRY[districtName];
      
      for (const talukName of taluks) {
        // Resolve or Create Taluk
        let taluk = await Taluk.findOne({ name: talukName, districtId: district._id });
        if (!taluk) {
          taluk = new Taluk({
            name: talukName,
            districtId: district._id,
            code: `${district.code}-${talukName.substring(0, 3).toUpperCase()}`,
            status: 'ACTIVE'
          });
          await taluk.save();
        }

        // Seed core departments for each taluk
        const coreDepts = ['TANGEDCO', 'Police', 'Revenue', 'TWAD', 'Health']; 
        
        for (const deptName of coreDepts) {
          await synchronizeOfficeNode(districtName, talukName, deptName);
        }
      }
    }

    console.log('[SEED] Statewide Administrative Registry Synchronized Successfully.');
  } catch (err) {
    console.error('[SEED_ERROR] Infrastructure Sync Failed:', err);
  }
};

module.exports = { seedStateInfrastructure };
