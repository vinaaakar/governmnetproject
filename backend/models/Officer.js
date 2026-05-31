const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const officerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  officialEmail: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  department: { type: String, required: true },
  district: { type: String, required: true },
  taluk: { type: String, required: true },
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'GovernmentOffice' },
  officeCode: { type: String }, // e.g. TNEB-CHN-TDP-7821
  
  role: { 
    type: String, 
    enum: ['VILLAGE_OFFICER', 'TALUK_OFFICER', 'DISTRICT_ADMIN', 'STATE_ADMIN', 'DEPARTMENT_HEAD'], 
    default: 'TALUK_OFFICER' 
  },
  clearanceLevel: { type: Number, default: 1, min: 1, max: 5 }, // 1-5 Scale
  registryStatus: { type: String, default: 'SYNCHRONIZED' },
  permissions: [{ type: String }],
  
  activeStatus: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String }
}, { timestamps: true });

// Password Hashing
officerSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password Verification
officerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Officer', officerSchema);
