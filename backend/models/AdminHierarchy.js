const mongoose = require('mongoose');

// --- District ---
const districtSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  name_ta: { type: String },
  code: { type: String, unique: true },
  region: { type: String }, // North, South, Central, West
  headquarters: { type: String },
  totalTaluks: { type: Number, default: 0 },
  totalVillages: { type: Number, default: 0 },
  totalGovernmentOffices: { type: Number, default: 0 },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE'], default: 'ONLINE' },
  latitude: Number,
  longitude: Number
});

// --- Taluk ---
const talukSchema = new mongoose.Schema({
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  name: { type: String, required: true },
  name_ta: { type: String },
  code: { type: String },
  villagesCount: { type: Number, default: 0 },
  officesCount: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' },
  headquarters: String
});

// --- Village ---
const villageSchema = new mongoose.Schema({
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  talukId: { type: mongoose.Schema.Types.ObjectId, ref: 'Taluk', required: true },
  name: { type: String, required: true },
  name_ta: { type: String },
  pincode: { type: String },
  aliases: [String], // for NLP matching
  latitude: Number,
  longitude: Number
});

const District = mongoose.model('District', districtSchema);
const Taluk = mongoose.model('Taluk', talukSchema);
const Village = mongoose.model('Village', villageSchema);

module.exports = { District, Taluk, Village };
