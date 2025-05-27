// server/routes/chat.js
const express = require('express');
const chatRouter = express.Router();
const {ConnectionRequestModel} = require('../models/connectionRequest.js'); // Adjust path
const {chatModel} = require('../models/chat.js'); // Adjust path
const { userAuth } = require('../middlewares/auth.js');

chatRouter.get('/chat/:id', userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id; // Logged-in user’s ID
    const toUserId = req.params.id;  // Target user’s ID

    // Check friendship status with correct field names
    const isFriend = await ConnectionRequestModel.findOne({
      $or: [
        { senderID: fromUserId, recieverID: toUserId, status: 'accepted' },
        { senderID: toUserId, recieverID: fromUserId, status: 'accepted' },
      ],
    });

    if (!isFriend) {
      return res.status(403).json({ message: 'You can only view messages with friends' });
    }

    // Fetch chat messages
    const chat = await chatModel
      .findOne({ participants: { $all: [fromUserId, toUserId] } })
      .populate(
        {
          path:'messages.senderId',
          select:'firstname lastname'
        }
      );
    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {chatRouter};