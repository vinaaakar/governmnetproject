const Complaint = require('../models/Complaint');
const ComplaintTimeline = require('../models/ComplaintTimeline');
const eventBus = require('../utils/eventBus');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Accept Complaint
 */
const acceptComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) return errorResponse(res, 404, 'Complaint not found');
    
    complaint.status = 'IN_PROGRESS';
    await complaint.save();

    await ComplaintTimeline.create({
      complaintId: complaint._id,
      action: 'ACCEPTED',
      officerId: req.officer._id,
      notes: 'Officer has acknowledged and accepted the grievance'
    });

    return successResponse(res, complaint, 'Grievance status updated to IN_PROGRESS');
  } catch (error) {
    return errorResponse(res, 500, 'Action failed', error.message);
  }
};

/**
 * Resolve Complaint
 */
const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionDetails } = req.body;
    
    const complaint = await Complaint.findById(id);
    if (!complaint) return errorResponse(res, 404, 'Complaint not found');

    complaint.status = 'RESOLVED';
    complaint.resolutionDetails = resolutionDetails;
    complaint.resolutionTimestamp = new Date();
    await complaint.save();

    await ComplaintTimeline.create({
      complaintId: complaint._id,
      action: 'RESOLVED',
      officerId: req.officer._id,
      notes: resolutionDetails
    });

    eventBus.emit('AUDIT_EVENT', {
      action: 'STATUS_CHANGED',
      complaintId: complaint._id,
      officerId: req.officer._id,
      metadata: { newStatus: 'RESOLVED' },
      req
    });

    return successResponse(res, complaint, 'Grievance resolved and archived');
  } catch (error) {
    return errorResponse(res, 500, 'Resolution failed', error.message);
  }
};

/**
 * Update Complaint Status (Universal Route for Frontend)
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const complaint = await Complaint.findById(id);

    if (!complaint) return errorResponse(res, 404, 'Complaint not found');

    complaint.status = status;
    if (status === 'RESOLVED') {
      complaint.resolutionDetails = note || 'Resolved by administrative node.';
      complaint.resolutionTimestamp = new Date();
    }
    await complaint.save();

    await ComplaintTimeline.create({
      complaintId: complaint._id,
      action: status,
      officerId: req.officer._id,
      notes: note || `Complaint status updated to ${status} by officer.`
    });

    eventBus.emit('AUDIT_EVENT', {
      action: 'STATUS_CHANGED',
      complaintId: complaint._id,
      officerId: req.officer._id,
      metadata: { newStatus: status },
      req
    });

    return successResponse(res, complaint, `Grievance status updated to ${status}`);
  } catch (error) {
    return errorResponse(res, 500, 'Action failed', error.message);
  }
};

module.exports = { acceptComplaint, resolveComplaint, updateComplaintStatus };
