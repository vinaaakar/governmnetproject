const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['AI_ANALYZED', 'ROUTED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'],
    default: 'AI_ANALYZED' 
  },
  citizenName: { type: String },
  citizenPhone: { type: String },
  citizenEmail: { type: String },
  citizenAddress: { type: String },
  anonymous: { type: Boolean, default: false },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    readableAddress: { type: String },
    district: { type: String },
    taluk: { type: String }
  },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
  assignedOfficeId: { type: mongoose.Schema.Types.ObjectId, ref: 'GovernmentOffice' },
  
  slaDeadline: { type: Date },
  lastStatusUpdate: { type: Date, default: Date.now },
  aiRoutingMetadata: {
    department: { type: String },
    category: { type: String },
    severity: { type: String },
    routingPath: [String]
  },
  
  resolutionDetails: { type: String },
  resolutionTimestamp: { type: Date },
  evidence: [{
    type: { type: String },
    url: { type: String }
  }]
}, { timestamps: true });

// Production-Grade Indexes for Statewide Scalability
complaintSchema.index({ complaintId: 1 }, { unique: true });
complaintSchema.index({ districtId: 1, status: 1 });
complaintSchema.index({ talukId: 1, status: 1 });
complaintSchema.index({ assignedOfficeId: 1, status: 1 });
complaintSchema.index({ departmentId: 1, status: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ priority: 1, status: 1 });
complaintSchema.index({ location: '2dsphere' }); // Geospatial index for office mapping
complaintSchema.index({ title: 'text', description: 'text' }); // Text index for AI semantic search

module.exports = mongoose.model('Complaint', complaintSchema);
