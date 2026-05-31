const Officer = require('../models/Officer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const eventBus = require('../utils/eventBus');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ucrs_secret_key_2026', {
    expiresIn: '8h'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'ucrs_refresh_secret', {
    expiresIn: '7d'
  });
};

const { DEMO_MODE } = require('../config/demoMode');

/**
 * Government Officer Authentication
 * Optimized for high-fidelity statewide demo with relaxed node constraints.
 */
const officerLogin = async (req, res) => {
  const { officialEmail, employeeId, password, officeId } = req.body;

  try {
    // 1. Validate Officer Identity (Primary)
    let officer = await Officer.findOne({ officialEmail }).populate('officeId');
    
    // Dynamic Handshake & Auto-Sync Recovery
    if (!officer && employeeId) {
      console.log(`[AUTH_RECOVERY] Node sync recovery activated for: ${officialEmail}`);
      try {
        const { DEPARTMENTS, DISTRICT_REGISTRY } = require('../data/statewideOfficerRegistry');
        const { synchronizeOfficeNode } = require('../services/registrySyncEngine');
        
        const parts = employeeId.split('-');
        if (parts.length === 4) {
          const [deptCode, districtUpper, talukUpper, suffix] = parts;
          
          if (suffix === "480") {
            // 1. Resolve department name
            const dept = DEPARTMENTS.find(d => d.code === deptCode);
            if (dept) {
              // 2. Find exact district and taluk case-insensitively
              let resolvedDistrict = null;
              let resolvedTaluk = null;
              
              for (const [dist, taluks] of Object.entries(DISTRICT_REGISTRY)) {
                if (dist.toUpperCase() === districtUpper) {
                  resolvedDistrict = dist;
                  for (const t of taluks) {
                    if (t.toUpperCase().replace(/\s+/g, '') === talukUpper.replace(/\s+/g, '')) {
                      resolvedTaluk = t;
                      break;
                    }
                  }
                  break;
                }
              }
              
              if (resolvedDistrict && resolvedTaluk) {
                console.log(`[AUTH_RECOVERY] Found matching registry node: ${resolvedDistrict} -> ${resolvedTaluk} (${dept.name})`);
                
                // First make sure District and Taluk AdminHierarchy documents exist in DB
                const { District, Taluk } = require('../models/AdminHierarchy');
                let dbDistrict = await District.findOne({ name: resolvedDistrict });
                if (!dbDistrict) {
                  dbDistrict = await District.create({
                    name: resolvedDistrict,
                    code: resolvedDistrict.toUpperCase(),
                    region: 'North',
                    status: 'ONLINE'
                  });
                }
                
                let dbTaluk = await Taluk.findOne({ name: resolvedTaluk, districtId: dbDistrict._id });
                if (!dbTaluk) {
                  await Taluk.create({
                    name: resolvedTaluk,
                    districtId: dbDistrict._id,
                    code: `${dbDistrict.code}-${resolvedTaluk.substring(0, 3).toUpperCase()}`,
                    status: 'ACTIVE'
                  });
                }
                
                // Now run office/officer synchronization
                const syncResult = await synchronizeOfficeNode(resolvedDistrict, resolvedTaluk, dept.name);
                if (syncResult && syncResult.officer) {
                  console.log(`[AUTH_RECOVERY] Node successfully synchronized on the fly.`);
                  officer = await Officer.findOne({ officialEmail }).populate('officeId');
                }
              }
            }
          }
        }
      } catch (recoveryErr) {
        console.error('[AUTH_RECOVERY_ERROR] Failed to synchronize node on the fly:', recoveryErr);
      }
    }
    
    if (!officer) {
      console.warn(`[AUTH_FAIL] Registry missing for: ${officialEmail}`);
      eventBus.emit('AUDIT_EVENT', {
        action: 'OFFICER_REGISTRY_MISSING',
        metadata: { email: officialEmail, reason: 'NOT_FOUND' },
        req
      });
      return errorResponse(res, 401, 'ERR-REG-401: Administrative identity not found in registry.', 'ERR-REG-401');
    }

    // 2. Cross-Verify Credentials
    const isPasswordValid = await bcrypt.compare(password, officer.password);
    const isEmployeeIdValid = officer.employeeId === employeeId;

    if (!isPasswordValid || !isEmployeeIdValid) {
       console.warn(`[AUTH_FAIL] Credential mismatch for ${officialEmail}`);
       return errorResponse(res, 401, 'ERR_AUTH_INVALID: Secure access credentials rejected.', 'ERR_AUTH_INVALID');
    }

    // 3. Node Affinity Check (Relaxed in DEMO_MODE)
    if (!DEMO_MODE && officeId && officer.officeId?._id.toString() !== officeId) {
       console.warn(`[AUTH_FAIL] Node Mismatch for ${officialEmail}`);
       return errorResponse(res, 403, 'ERR-NODE-403: Regional node access rejected.', 'ERR-NODE-403');
    }

    // 4. Verification of Active Status
    if (officer.activeStatus === false) {
       return errorResponse(res, 403, 'ERR_ACCOUNT_DISABLED: Administrative account is inactive.', 'ERR_ACCOUNT_DISABLED');
    }

    // 5. Generate Secure Session Tokens
    const token = jwt.sign(
      { id: officer._id, role: 'OFFICER', clearanceLevel: officer.clearanceLevel },
      process.env.JWT_SECRET || 'ucrs_secret_key_2026',
      { expiresIn: '8h' }
    );

    const refreshToken = jwt.sign(
      { id: officer._id },
      process.env.JWT_REFRESH_SECRET || 'ucrs_refresh_secret',
      { expiresIn: '7d' }
    );

    // 6. Record Authorized Access
    eventBus.emit('AUDIT_EVENT', {
      action: 'OFFICER_ACCESS_AUTHORIZED',
      officerId: officer._id,
      metadata: { 
         node: officer.officeCode,
         clearance: officer.clearanceLevel
      },
      req
    });

    console.log(`[AUTH_SUCCESS] Access Granted: ${officer.fullName} | Node: ${officer.officeCode}`);

    // Self-healing complaint mapping: automatically map matching unassigned complaints to this officer
    try {
      const Complaint = require('../models/Complaint');
      const ComplaintTimeline = require('../models/ComplaintTimeline');
      const unassignedComplaints = await Complaint.find({
        'location.district': officer.district,
        'location.taluk': officer.taluk,
        'aiRoutingMetadata.department': officer.department,
        assignedOfficerId: null
      });

      if (unassignedComplaints.length > 0) {
        console.log(`[SELF_HEALING] Mapping ${unassignedComplaints.length} unassigned matching complaints to newly authenticated officer: ${officer.fullName}`);
        for (const c of unassignedComplaints) {
          c.assignedOfficerId = officer._id;
          c.assignedOfficeId = officer.officeId?._id || officer.officeId;
          c.status = 'ROUTED';
          await c.save();

          await ComplaintTimeline.create({
            complaintId: c._id,
            action: 'ROUTED',
            officerId: officer._id,
            notes: `Self-healing routed. Assigned to ${officer.fullName} upon node activation.`
          });
        }
      }
    } catch (selfHealErr) {
      console.error('[SELF_HEALING_ERROR] Failed to map unassigned complaints:', selfHealErr);
    }

    res.json({
      success: true,
      message: 'Administrative Access Granted',
      data: {
        token,
        refreshToken,
        officer: {
          id: officer._id,
          fullName: officer.fullName,
          officialEmail: officer.officialEmail,
          employeeId: officer.employeeId,
          department: officer.department,
          district: officer.district,
          taluk: officer.taluk,
          officeCode: officer.officeCode,
          clearanceLevel: officer.clearanceLevel,
          registryStatus: officer.registryStatus
        },
        session: {
          uplinkId: `TN-SDRC-${Math.random().toString(36).substring(7).toUpperCase()}`,
          establishedAt: new Date()
        }
      }
    });
  } catch (err) {
    console.error('[AUTH_CRITICAL] Gateway Error:', err);
    return errorResponse(res, 500, 'ERR-INFRA-500: Statewide registry node unreachable.', 'ERR-INFRA-500');
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return errorResponse(res, 401, 'Refresh Token Required');

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'ucrs_refresh_secret');
    const officer = await Officer.findById(decoded.id);

    if (!officer || officer.refreshToken !== refreshToken) {
      return errorResponse(res, 403, 'Invalid Refresh Token');
    }

    const newAccessToken = generateToken(officer._id);
    return successResponse(res, { token: newAccessToken }, 'Token Refreshed');
  } catch (err) {
    return errorResponse(res, 403, 'Expired or Invalid Refresh Token');
  }
};

const officerLogout = async (req, res) => {
  try {
    const officer = await Officer.findById(req.officer._id);
    if (officer) {
      officer.refreshToken = null;
      await officer.save();
    }
    return successResponse(res, null, 'Logged out from TN-SDRC node');
  } catch (error) {
    return errorResponse(res, 500, 'Logout Failed', error.message);
  }
};

const getOfficerProfile = async (req, res) => {
  return successResponse(res, req.officer, 'Profile Retrieved');
};

module.exports = {
  officerLogin,
  refreshToken,
  officerLogout,
  getOfficerProfile
};
