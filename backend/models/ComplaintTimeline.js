const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'CREATED', 'AI_ANALYZED', 'ROUTED', 'OFFICER_ASSIGNED', 
      'ACCEPTED', 'IN_PROGRESS', 'FIELD_VISIT_REQUESTED', 
      'ESCALATED', 'TRANSFERRED', 'RESOLVED', 'SLA_BREACH'
    ]
  },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
  officeName: { type: String },
  notes: { type: String },
  node: { type: String, default: 'TN-SDRC-01' },
  timestamp: { type: Date, default: Date.now }
});

timelineEntrySchema.index({ complaintId: 1, timestamp: -1 });

module.exports = mongoose.model('ComplaintTimeline', timelineEntrySchema);
