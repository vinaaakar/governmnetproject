const mongoose = require('mongoose');

const governmentOfficeSchema = new mongoose.Schema({
  officeName: { type: String, required: true },
  officeType: { 
    type: String, 
    enum: [
      'Section Office', 'Division Office', 'Subdivision', 'Panchayat Union', 'Zone Office',
      'Executive Office', 'Regional Node', 'District Headquarters', 'Taluk Office', 'Village Administrative Center'
    ], 
    required: true 
  },
  
  department: { type: String, required: true },
  district: { type: String, required: true },
  taluk: { type: String },
  
  // References for structured queries
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  talukId: { type: mongoose.Schema.Types.ObjectId, ref: 'Taluk' },
  
  officeCode: { type: String, unique: true },
  address: { type: String },
  pincode: { type: String },
  
  activeOfficers: { type: Number, default: 1 },
  complaintCapacity: { type: Number, default: 1000 },
  
  telemetry: {
    panchayats: Number,
    regionalOffices: Number,
    slaHealth: String,
    latency: String,
    load: String
  },
  
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [80.2707, 13.0827] } // [longitude, latitude]
  },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

governmentOfficeSchema.index({ location: '2dsphere' });
governmentOfficeSchema.index({ district: 1, taluk: 1, department: 1 });

module.exports = mongoose.model('GovernmentOffice', governmentOfficeSchema);
