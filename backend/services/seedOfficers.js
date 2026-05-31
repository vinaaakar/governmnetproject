const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Officer = require('./models/Officer');

dotenv.config();

const officers = [
  {
    fullName: 'Arun Kumar',
    email: 'officer.eb@tn.gov.in',
    password: 'Admin@123',
    role: 'officer',
    department: 'Tamil Nadu Electricity Board (TANGEDCO)',
    district: 'Chennai',
    employeeId: 'TNEB7721',
    isActive: true
  },
  {
    fullName: 'Sangeetha Raj',
    email: 'water.coimbatore@tn.gov.in',
    password: 'Admin@123',
    role: 'officer',
    department: 'Water Supply & Drainage Board',
    district: 'Coimbatore',
    employeeId: 'TWAD8892',
    isActive: true
  },
  {
    fullName: 'Meena Subramanian',
    email: 'collector.madurai@tn.gov.in',
    password: 'Admin@123',
    role: 'admin',
    department: 'District Revenue Office',
    district: 'Madurai',
    employeeId: 'IAS4412',
    isActive: true
  }
];

const seedOfficers = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.log('No MONGO_URI found in .env. Skipping seed.');
      return;
    }
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing officers
    await Officer.deleteMany();
    console.log('Cleared existing officers.');

    // Add new officers
    for (const officer of officers) {
      await Officer.create(officer);
    }
    
    console.log('Successfully seeded 3 demo officer accounts.');
    process.exit();
  } catch (error) {
    console.error('Error seeding officers:', error);
    process.exit(1);
  }
};

seedOfficers();
