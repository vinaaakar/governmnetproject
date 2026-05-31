const Complaint = require('../models/Complaint');
const Officer = require('../models/Officer');
const { District, Taluk } = require('../models/AdminHierarchy');
const GovernmentOffice = require('../models/GovernmentOffice');

// GET /api/admin/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const officerId = req.officer.id || req.officer._id;
    const officer = await Officer.findById(officerId);
    if (!officer) return res.status(404).json({ message: 'Officer not found' });

    let query = {};
    
    // Role-based routing filter
    if (officer.role !== 'STATE_ADMIN') {
      query.$or = [
        { assignedOfficerId: officer._id },
        { assignedOfficeId: officer.officeId }
      ];
    }

    const stats = {
      active: await Complaint.countDocuments({ ...query, status: { $in: ['AI_ANALYZED', 'ROUTED', 'IN_PROGRESS'] } }),
      highPriority: await Complaint.countDocuments({ ...query, priority: 'High', status: { $ne: 'RESOLVED' } }),
      pendingSLA: await Complaint.countDocuments({ ...query, status: 'IN_PROGRESS' }), // Simplified logic
      resolvedToday: await Complaint.countDocuments({ 
        ...query, 
        status: 'RESOLVED',
        updatedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
      }),
      aiRouted: await Complaint.countDocuments({ ...query, aiRoutingConfidence: { $gt: 0.8 } }),
      villageCoverage: 0 // Placeholder
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/complaints
exports.getDashboardComplaints = async (req, res) => {
  try {
    const officerId = req.officer.id || req.officer._id;
    const officer = await Officer.findById(officerId);
    
    let query = {};
    const { status, priority } = req.query;

    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Role-based routing filter
    if (officer.role !== 'STATE_ADMIN') {
      query.$or = [
        { assignedOfficerId: officer._id },
        { assignedOfficeId: officer.officeId }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('assignedOfficerId', 'fullName role phone')
      .populate('assignedOfficeId')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/complaints/:id/action
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { action, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Workflow Logic
    switch (action) {
      case 'ACCEPT':
        complaint.status = 'IN_PROGRESS';
        break;
      case 'RESOLVE':
        complaint.status = 'RESOLVED';
        complaint.resolutionDetails = note;
        break;
      case 'ESCALATE':
        complaint.status = 'ESCALATED';
        break;
      case 'TRANSFER':
        // logic for transfer...
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
