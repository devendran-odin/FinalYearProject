import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import axios from "axios";
import routes from "./routes/index.js"
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import userRoutes from './routes/userRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import User from './models/User.js';
import Message from './models/Message.js';


dotenv.config();

// Verify JWT secret key is loaded
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}
console.log('JWT_SECRET loaded successfully');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());  

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  console.log('Authenticating socket connection...');
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.log('No token provided in socket connection');
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    console.log('Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, finding user...');
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('User not found for token:', decoded.userId);
      return next(new Error('Authentication error: User not found'));
    }

    console.log('User authenticated:', user._id);
    socket.userId = user._id;
    socket.userRole = user.role;
    next();
  } catch (err) {
    console.error('Socket authentication error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    if (err.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    } else if (err.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    } else {
      return next(new Error('Authentication error: ' + err.message));
    }
  }
});

// Store active calls
const activeRooms = new Map();

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId }) => {
    console.log(`User ${socket.id} joining room ${roomId}`);
    socket.join(roomId);
    const room = io.sockets.adapter.rooms.get(roomId);
    const participants = Array.from(room || []);
    
    console.log('Room participants:', participants);

    // Notify the joining user
    socket.emit('room-joined', {
      isCreator: participants.length === 1,
      participants
    });

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      participants
    });
  });

  socket.on('offer', ({ roomId, offer, senderId, targetId }) => {
    console.log(`Routing offer from ${senderId} to ${targetId}`);
    io.to(targetId).emit('offer', {
      offer,
      userId: senderId
    });
  });

  socket.on('answer', ({ roomId, answer, senderId, targetId }) => {
    console.log(`Routing answer from ${senderId} to ${targetId}`);
    io.to(targetId).emit('answer', {
      answer,
      senderId
    });
  });

  socket.on('ice-candidate', ({ roomId, candidate, senderId, targetId }) => {
    console.log(`Routing ICE candidate from ${senderId} to ${targetId}`, {
      type: candidate.candidate ? candidate.candidate.split(' ')[7] : 'null',
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    });
    
    // Send directly to the target peer
    io.to(targetId).emit('ice-candidate', {
      candidate,
      senderId
    });
  });

  socket.on('leave-room', ({ roomId }) => {
    console.log(`User ${socket.id} leaving room ${roomId}`);
    socket.leave(roomId);
    io.to(roomId).emit('user-left', {
      userId: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Notify all rooms this user was in
    Array.from(socket.rooms || []).forEach(roomId => {
      if (roomId !== socket.id) {
        io.to(roomId).emit('user-left', {
          userId: socket.id
        });
      }
    });
  });
});

// Make io instance available to controllers
app.set('io', io);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("API key is missing. Please check your .env file.");
  process.exit(1);
}
const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

// AI Chat Route
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post(
            endpoint,
            {
                messages: [{ role: "user", content: `Respond in Markdown format and Provide a balanced response—concise yet informative, offering key details without unnecessary elaboration :\n\n${message}`}],
                model: "deepseek-r1-distill-llama-70b",
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract AI response and clean unwanted <think> tags
        const aiResponse = response.data.choices[0]?.message?.content || "No response";
        const cleanedResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        res.json({ id: Date.now().toString(), content: cleanedResponse });

    } catch (error) {
        console.error("Error in API:", error);
        res.status(500).json({ content: "Error processing request" });
    }
});

// Routes
app.use("/api", routes);
app.use('/api/users', userRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

httpServer.listen(port, ()=> {
    console.log(`Server is running on port ${port}...`)
});

