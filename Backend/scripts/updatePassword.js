import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const updatePassword = async () => {
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

    // Generate new salt and hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('yourpassword', salt); // Replace 'yourpassword' with the actual password

    // Update the user's password
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    console.log('Password updated successfully');
    console.log('New password hash:', updatedUser.password);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updatePassword(); 