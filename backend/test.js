const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const Officer = require('./models/Officer');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ucrs'); // Or however it connects. wait, memory server is used.
  } catch(e) {}
}
