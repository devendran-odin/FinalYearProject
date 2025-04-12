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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());  

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id;
    socket.userRole = user.role;
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining their personal room
  socket.on('join_room', ({ userId }) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle new messages
  socket.on('new_message', async (message) => {
    try {
      // Save message to database
      const savedMessage = await Message.create(message);
      
      // Get the message with populated sender and recipient
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate('sender', 'name')
        .populate('recipient', 'name');
      
      // Emit to sender's room
      io.to(message.sender).emit('new_message', populatedMessage);
      
      // Emit to recipient's room
      io.to(message.recipient).emit('new_message', populatedMessage);
      
      // Update chat list for both users
      io.to(message.sender).emit('update_chat_list', { 
        mentorId: message.recipient,
        lastMessage: populatedMessage
      });
      io.to(message.recipient).emit('update_chat_list', { 
        mentorId: message.sender,
        lastMessage: populatedMessage
      });
    } catch (error) {
      console.error('Error handling new message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing events
  socket.on('typing', ({ recipientId, isTyping }) => {
    io.to(recipientId).emit('typing', { senderId: socket.userId, isTyping });
  });

  // Handle read receipts
  socket.on('mark_read', async ({ senderId }) => {
    try {
      await Message.updateMany(
        { sender: senderId, recipient: socket.userId, read: false },
        { $set: { read: true } }
      );
      io.to(senderId).emit('messages_read', { senderId: socket.userId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
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

