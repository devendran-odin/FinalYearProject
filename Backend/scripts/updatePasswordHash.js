import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const updatePasswordHash = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'devsanthosh720@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    // Generate new hash with $2b$ version
    const salt = await bcrypt.genSalt(10);
    const newPassword = 'Pass123';
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await User.findByIdAndUpdate(
      user._id,
      { $set: { password: hashedPassword } }
    );

    console.log('Password hash updated successfully');
    console.log('New password hash:', hashedPassword);
  } catch (error) {
    console.error('Error updating password hash:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updatePasswordHash(); 