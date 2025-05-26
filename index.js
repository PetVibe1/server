const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const petRoutes = require('./routes/petRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Connect to database
connectDB();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Make sure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Created uploads directory:', uploadsPath);
}

// Configure Socket.IO with proper CORS settings
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      // Parse the comma-separated list of allowed origins
      const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',');
      
      // Check if the request origin is in the allowed list or if it's null (e.g. same origin)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`Socket.IO origin ${origin} not allowed`);
        callback(null, true); // Allow anyway for now, but log a warning
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io',
  serveClient: false,
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
  connectTimeout: 30000
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Parse the comma-separated list of allowed origins
    const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',');
    
    // Check if the request origin is in the allowed list or if it's null (e.g. same origin)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`HTTP origin ${origin} not allowed`);
      callback(null, true); // Allow anyway for now, but log a warning
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make uploads folder static
console.log('Setting static path for uploads:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Join a pet room when viewing a pet
  socket.on('join_pet_room', (petId) => {
    if (petId) {
      const roomName = `pet_${petId}`;
      socket.join(roomName);
      console.log(`User ${socket.id} joined room: ${roomName}`);
    } else {
      console.warn('Received join_pet_room event without a valid petId');
    }
  });
  
  // Leave a pet room
  socket.on('leave_pet_room', (petId) => {
    if (petId) {
      const roomName = `pet_${petId}`;
      socket.leave(roomName);
      console.log(`User ${socket.id} left room: ${roomName}`);
    }
  });
  
  // Disconnect event
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected (${reason}):`, socket.id);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
});

// Make io available in the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Root API endpoint for easy verification
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Test upload endpoint
app.get('/api/upload-test', (req, res) => {
  res.send(`
    <h1>Test File Upload</h1>
    <form action="/api/upload/multiple" method="post" enctype="multipart/form-data">
      <input type="file" name="images" multiple />
      <button type="submit">Upload</button>
    </form>
  `);
});

// Socket.io status endpoint
app.get('/api/socket-status', (req, res) => {
  res.json({
    status: 'ok',
    connections: Object.keys(io.sockets.sockets).length,
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Server error occurred', 
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server available at http://localhost:${PORT}`);
}); 