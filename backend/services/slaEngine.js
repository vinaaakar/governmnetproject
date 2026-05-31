/**
 * SLA Engine
 * Manages operational deadlines and escalation rules based on grievance priority.
 */

const SLA_CONFIG = {
  High: { hours: 24, label: 'Critical / 24h' },
  Medium: { hours: 120, label: 'Standard / 5 Days' },
  Low: { hours: 168, label: 'Routine / 7 Days' }
};

/**
 * Calculate SLA Deadline
 */
const calculateDeadline = (priority) => {
  const config = SLA_CONFIG[priority] || SLA_CONFIG.Medium;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + config.hours);
  return deadline;
};

/**
 * Check for SLA Breaches
 */
const checkSLABreach = (deadline) => {
  return new Date() > new Date(deadline);
};

module.exports = { calculateDeadline, checkSLABreach };
