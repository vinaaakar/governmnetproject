const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  name_ta: { type: String },
  category: { type: String }, // Utility, Law, Health, Admin
  routingKeywords: [String],
  priorityRules: {
    criticalKeywords: [String],
    defaultPriority: { type: String, default: 'Medium' }
  },
  escalationRules: {
    maxHoursVillage: { type: Number, default: 48 },
    maxHoursTaluk: { type: Number, default: 120 } // 5 days
  }
});

module.exports = mongoose.model('Department', departmentSchema);
