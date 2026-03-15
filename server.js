const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      mediaSrc: ["'self'", "blob:"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: "*", // Allow all origins for public access
  methods: ["GET", "POST"],
  credentials: true
};
app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve main application route
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexcall')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.log('MongoDB connection error:', err.message);
    console.log('Server will continue running without database...');
  });

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'from:', socket.handshake.origin);

  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);
    console.log(`Users in room ${roomId}:`, io.sockets.adapter.rooms.get(roomId)?.size || 1);
  });

  socket.on('offer', (data) => {
    socket.to(data.room).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    socket.to(data.room).emit('answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.room).emit('ice-candidate', data.candidate);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// For cloud platforms that require specific host binding
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
