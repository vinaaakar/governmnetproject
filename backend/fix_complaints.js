const mongoose = require('mongoose');
const Officer = require('./models/Officer');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  try {
    const mongooseURL = "mongodb://127.0.0.1:27017/ucrs" // The app runs mongodb-memory-server, but does it bind to 27017?
  } catch(e) {}
}
