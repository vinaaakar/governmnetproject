const EventEmitter = require('events');
const AuditLog = require('../models/AuditLog');

class GovernanceEventBus extends EventEmitter {
  constructor() {
    super();
    this.on('AUDIT_EVENT', this.logToDatabase);
  }

  // Centralized logging for all infrastructure events
  async logToDatabase({ action, officerId, complaintId, metadata, req }) {
    try {
      await AuditLog.create({
        action,
        officerId,
        complaintId,
        metadata,
        ipAddress: req?.ip,
        userAgent: req?.headers['user-agent']
      });
      console.log(`[AUDIT] ${action} recorded for complaint ${complaintId || 'N/A'}`);
    } catch (err) {
      console.error('[AUDIT_ERROR] Failed to record log:', err.message);
    }
  }

  // Broadcaster to Socket.io (to be linked in server.js)
  emitToSocket(io, room, event, data) {
    if (io) {
      io.to(room).emit(event, data);
    }
  }
}

const eventBus = new GovernanceEventBus();
module.exports = eventBus;
