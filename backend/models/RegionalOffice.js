const mongoose = require('mongoose');

const regionalOfficeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String },
  district: { type: String },
  state: { type: String },
  createdAt: { type: Date, default: Date.now }
});

regionalOfficeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RegionalOffice', regionalOfficeSchema);
