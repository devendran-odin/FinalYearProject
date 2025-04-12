import User from "../models/User.js";

export const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password");
    res.status(200).json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: "Error fetching mentors" });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const mentor = await User.findOne({ 
      _id: req.params.id,
      role: 'mentor'
    }).select('-password');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.json(mentor);
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ message: 'Error fetching mentor' });
  }
}; 