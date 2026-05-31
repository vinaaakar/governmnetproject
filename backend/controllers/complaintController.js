const Complaint = require('../models/Complaint');
const ComplaintTimeline = require('../models/ComplaintTimeline');
const Officer = require('../models/Officer');
const { analyzeAndRoute } = require('../services/aiRoutingEngine');
const { calculateDeadline } = require('../services/slaEngine');
const eventBus = require('../utils/eventBus');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Submit Citizen Complaint (AI-Powered Grievance Lifecycle)
 */
const submitComplaint = async (req, res) => {
  try {
    const { 
      citizenName, citizenPhone, citizenEmail, 
      title, description, category, district, taluk, location, anonymous
    } = req.body;

    // 1. AI Analysis & Routing
    const aiAnalysis = await analyzeAndRoute(title, description);
    
    // 2. SLA Calculation
    const deadline = calculateDeadline(aiAnalysis.priority);

    // 3. Dynamic Government Tracking ID Generation
    // Format: TN-UCRS-<DIST>-<YEAR>-<RANDOM>
    const distCode = (district || 'GEN').substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    const trackingId = `TN-UCRS-${distCode}-${year}-${random}`;

    // 4. Create Complaint with Metadata
    const complaint = await Complaint.create({
      complaintId: trackingId,
      citizenName: citizenName || (anonymous ? 'Anonymous Citizen' : 'Public User'),
      citizenPhone: citizenPhone || 'UNAVAILABLE',
      citizenEmail,
      anonymous: !!anonymous,
      title,
      description,
      location,
      category: aiAnalysis.category || category,
      priority: aiAnalysis.priority,
      status: 'AI_ANALYZED',
      slaDeadline: deadline,
      aiRoutingMetadata: {
        ...aiAnalysis,
        assignedOffice: `${district} ${taluk} ${aiAnalysis.department} Office`
      }
    });

    // 5. Initial Lifecycle Timeline
    await ComplaintTimeline.create({
      complaintId: complaint._id,
      action: 'AI_ANALYZED',
      notes: 'Grievance securely uploaded and analyzed by Statewide AI Engine.'
    });

    // 6. Automatic Routing & Officer Assignment
    let assignedOfficer = await Officer.findOne({ 
      department: aiAnalysis.department, 
      district: district,
      taluk: taluk,
      activeStatus: true 
    });

    if (!assignedOfficer) {
      console.log(`[ROUTE] No specific officer found for ${district}-${taluk} (${aiAnalysis.department}). Attempting dynamic synchronization...`);
      try {
        const { DEPARTMENTS } = require('../data/statewideOfficerRegistry');
        const deptConfig = DEPARTMENTS.find(d => d.name === aiAnalysis.department);
        if (deptConfig) {
          // First make sure District and Taluk AdminHierarchy documents exist in DB
          const { District, Taluk } = require('../models/AdminHierarchy');
          let dbDistrict = await District.findOne({ name: district });
          if (!dbDistrict) {
            dbDistrict = await District.create({
              name: district,
              code: district.toUpperCase(),
              region: 'North',
              status: 'ONLINE'
            });
          }
          
          let dbTaluk = await Taluk.findOne({ name: taluk, districtId: dbDistrict._id });
          if (!dbTaluk) {
            await Taluk.create({
              name: taluk,
              districtId: dbDistrict._id,
              code: `${dbDistrict.code}-${taluk.substring(0, 3).toUpperCase()}`,
              status: 'ACTIVE'
            });
          }

          // Call the synchronize office node engine on-the-fly
          const { synchronizeOfficeNode } = require('../services/registrySyncEngine');
          const syncResult = await synchronizeOfficeNode(district, taluk, aiAnalysis.department);
          if (syncResult && syncResult.officer) {
            assignedOfficer = syncResult.officer;
            console.log(`[ROUTE_SYNC] Node ${district}-${taluk} successfully synchronized on the fly during complaint creation.`);
          }
        }
      } catch (syncErr) {
        console.error('[ROUTE_SYNC_ERROR] Dynamic node sync failed:', syncErr);
      }
    }

    if (!assignedOfficer) {
      console.log(`[ROUTE] Dynamic sync unavailable or failed. Falling back to district node for ${district} (${aiAnalysis.department}).`);
      assignedOfficer = await Officer.findOne({ 
        department: aiAnalysis.department, 
        district: district,
        activeStatus: true 
      });
    }

    if (assignedOfficer) {
      complaint.assignedOfficerId = assignedOfficer._id;
      complaint.assignedOfficeId = assignedOfficer.officeId;
      complaint.status = 'ROUTED';
      await complaint.save();

      await ComplaintTimeline.create({
        complaintId: complaint._id,
        action: 'ROUTED',
        officerId: assignedOfficer._id,
        notes: `Routed to ${district} Node. Assigned to ${assignedOfficer.fullName}.`
      });

      // Notify Officer via Real-time Bus
      eventBus.emit('BROADCAST_COMPLAINT', {
        type: 'NEW_ASSIGNMENT',
        officerId: assignedOfficer._id,
        complaintId: trackingId,
        district: district
      });
    }

    // 7. Audit Logging
    eventBus.emit('AUDIT_EVENT', {
      action: 'COMPLAINT_CREATED',
      complaintId: complaint._id,
      metadata: { id: trackingId, district, dept: aiAnalysis.department },
      req
    });

    return successResponse(res, {
      complaintId: trackingId,
      status: complaint.status,
      assignedDept: aiAnalysis.department,
      district,
      taluk,
      priority: aiAnalysis.priority,
      slaDeadline: deadline,
      assignedOffice: `${district} ${taluk} ${aiAnalysis.department} Node`,
      confidence: aiAnalysis.confidence
    }, 'Grievance lifecycle initiated successfully');

  } catch (error) {
    console.error('[LIFECYCLE_ERROR]', error);
    return errorResponse(res, 500, 'Statewide grievance uplink failed.', error.message);
  }
};

/**
 * Get Complaint Tracking Data for Citizen
 */
const trackComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOne({ complaintId: id })
      .populate('assignedOfficerId', 'fullName role phone');
    
    if (!complaint) return errorResponse(res, 404, 'Complaint not found in statewide registry');

    const timeline = await ComplaintTimeline.find({ complaintId: complaint._id })
      .sort({ timestamp: 1 });

    return successResponse(res, { complaint, timeline }, 'Tracking data retrieved');
  } catch (error) {
    return errorResponse(res, 500, 'Tracking failed', error.message);
  }
};

/**
 * Get Complaints for a specific citizen
 */
const getCitizenComplaints = async (req, res) => {
  try {
    const { phone } = req.query; 
    const complaints = await Complaint.find(phone ? { citizenPhone: phone } : {})
      .sort({ createdAt: -1 });
    return successResponse(res, complaints, 'Citizen grievances retrieved');
  } catch (error) {
    return errorResponse(res, 500, 'Ledger retrieval failed', error.message);
  }
};

module.exports = { submitComplaint, trackComplaint, getCitizenComplaints };
