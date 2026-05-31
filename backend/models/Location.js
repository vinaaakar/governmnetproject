const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  district: { type: String, required: true },
  taluks: [{
    name: { type: String, required: true },
    blocks: [{
      name: { type: String, required: true },
      villages: [String]
    }]
  }]
});

module.exports = mongoose.model('Location', locationSchema);
