const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: [
      'COMPLAINT_CREATED', 'AI_ROUTED', 'OFFICER_ASSIGNED', 
      'STATUS_CHANGED', 'ESCALATED', 'TRANSFERRED', 
      'OFFICER_LOGIN', 'OFFICER_LOGOUT', 'SLA_BREACH', 'DATA_EXPORT',
      'OFFICER_REGISTRY_MISSING', 'OFFICER_AUTH_REJECTED', 'OFFICER_ACCESS_AUTHORIZED'
    ]
  },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Store dynamic context like old/new status
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast audit reporting
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ officerId: 1, timestamp: -1 });
auditLogSchema.index({ complaintId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
