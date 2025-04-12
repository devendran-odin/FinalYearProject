import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const updateUserSchema = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the user to update
    const user = await User.findOne({ email: 'devsanthosh720@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    // Update the user to match the new schema
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          otherField: '',
          keywords: [],
          experience: '',
          updatedAt: new Date()
        },
        $unset: {
          expertise: 1,
          bio: 1,
          profilePicture: 1,
          availability: 1
        }
      },
      { new: true }
    );

    console.log('User updated successfully:', updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateUserSchema(); 