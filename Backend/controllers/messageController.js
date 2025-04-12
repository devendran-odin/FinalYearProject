import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all mentors that the user has chatted with
export const getChatMentors = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find all messages where the user is involved and there's actual message content
    const messages = await Message.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { sender: userId },
                { recipient: userId }
              ]
            },
            { content: { $exists: true, $ne: "" } } // Ensure there's actual message content
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { 
            otherId: {
              $cond: {
                if: { $eq: ['$sender', userId] },
                then: '$recipient',
                else: '$sender'
              }
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $and: [
                    { $eq: ['$_id', '$$otherId'] },
                    // If user is a mentor, look for mentees; if user is a mentee, look for mentors
                    { $eq: ['$role', userRole === 'mentor' ? 'mentee' : 'mentor'] }
                  ]
                }
              }
            }
          ],
          as: 'otherUserInfo'
        }
      },
      {
        $match: {
          'otherUserInfo': { $ne: [] } // Only include if other user info exists
        }
      },
      {
        $unwind: '$otherUserInfo'
      },
      {
        $group: {
          _id: '$otherUserInfo._id',
          name: { $first: '$otherUserInfo.name' },
          field: { $first: '$otherUserInfo.field' },
          profileImage: { $first: '$otherUserInfo.profileImage' },
          lastMessage: { $last: '$content' },
          lastMessageTime: { $last: '$createdAt' },
          messageCount: { $sum: 1 } // Count number of messages
        }
      },
      {
        $match: {
          messageCount: { $gt: 0 } // Only include users with actual messages
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json(messages);
  } catch (error) {
    console.error('Error in getChatMentors:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findOne({ _id: recipientId });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // For new conversations, ensure recipient is a mentor and sender is a mentee
    if (!await hasExistingChat(senderId, recipientId)) {
      if (recipient.role !== 'mentor') {
        return res.status(400).json({ message: 'You can only start conversations with mentors' });
      }
      if (req.user.role === 'mentor') {
        return res.status(403).json({ message: 'Only mentees can initiate conversations' });
      }
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content
    });

    await message.save();

    // If this is the first message, emit a chat list update
    if (!await hasExistingChat(senderId, recipientId)) {
      // Emit socket event for new chat
      const io = req.app.get('io');
      if (io) {
        io.to(recipientId).to(senderId).emit('update_chat_list');
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to check if there's an existing chat between users
const hasExistingChat = async (userId1, userId2) => {
  const existingMessage = await Message.findOne({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ]
  });
  return !!existingMessage;
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const recipientId = req.user._id;

    await Message.updateMany(
      { sender: senderId, recipient: recipientId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 