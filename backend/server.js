const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const eventBus = require('./utils/eventBus');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} | Auth: ${req.headers.authorization ? 'Bearer ' + req.headers.authorization.substring(7, 20) + '...' : 'None'}`);
  const oldJson = res.json;
  res.json = function(data) {
    console.log(`[RESPONSE] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} | Data:`, JSON.stringify(data).substring(0, 400));
    return oldJson.apply(res, arguments);
  };
  next();
});


// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Real-time Uplink Initialization
io.on('connection', (socket) => {
  console.log('[SOCKET] Node Connected:', socket.id);
  
  socket.on('join-district', (districtId) => {
    socket.join(`district-${districtId}`);
    console.log(`[SOCKET] Node joined district room: ${districtId}`);
  });

  socket.on('disconnect', () => {
    console.log('[SOCKET] Node Disconnected');
  });
});

// Global Event Mapping for Real-time Updates
eventBus.on('BROADCAST_COMPLAINT', (data) => {
  io.emit('new-complaint', data); // Broadcast to all for global telemetry
  if (data.districtId) {
    io.to(`district-${data.districtId}`).emit('district-update', data);
  }
});

// Database Connection
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.log('[DB] No MONGO_URI found, initializing MongoMemoryServer...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('[DB] Connected to Registry:', mongoUri.startsWith('mongodb://127.0.0.1') ? 'Memory' : 'Remote');
    
    // Initial infrastructure seeding
    const { seedStateInfrastructure } = require('./services/seedService');
    await seedStateInfrastructure();
  } catch (err) {
    console.error('[DB_ERROR] Registry Connection Failed:', err);
    process.exit(1);
  }
};

connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const officerComplaintRoutes = require('./routes/officerComplaintRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/officer/dashboard', dashboardRoutes);
app.use('/api/officer/complaints', officerComplaintRoutes);

// Global Error Handler (Must be after routes)
app.use(errorHandler);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UCRS Scalable Infrastructure is Operational', uptime: process.uptime() });
});

app.get('/api/health-check/officers', async (req, res) => {
  try {
    const Officer = require('./models/Officer');
    const officers = await Officer.find({}, 'fullName officialEmail employeeId department district taluk activeStatus officeCode');
    res.json({ success: true, count: officers.length, officers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Background Background Jobs (CRON)
// SLA Monitoring: Runs every hour to check for overdue complaints
cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Initiating Hourly SLA Compliance Check...');
  // Logic for SLA check and auto-escalation would go here
  eventBus.emit('SLA_CHECK_TRIGGERED', { timestamp: new Date() });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`[SERVER] UCRS Infrastructure Node Online on Port ${PORT}`);
});
