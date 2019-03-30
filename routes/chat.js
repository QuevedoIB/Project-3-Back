const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');

const SocketManager = require('../SocketManager');

router.post('/create', async (req, res, next) => {
  const { contactId } = req.body;
  const { _id } = req.session.currentUser;

  try {
    const isChat = await Chat.findOne({ $and: [{ users: { $in: [contactId] } }, { users: { $in: [_id] } }] });

    if (!isChat) {
      const contact = await User.findById(contactId);
      const contactData = {
        _id: contact._id,
        imageUrl: contact.imageUrl,
        username: contact.username
      };
      const newChat = {
        history: [],
        users: [_id, contactId]
      };
      const createdChat = await Chat.create(newChat);

      const data = {
        _id: createdChat._id,
        contact: contactData,
        log: createdChat.history
      };
      SocketManager.messageReceived(createdChat._id);
      res.status(200);
      res.json(data);
    }

    res.json({ message: 'Already created' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  const user = req.session.currentUser;

  try {
    const contact = await User.findById(id);
    const contactData = {
      _id: contact._id,
      imageUrl: contact.imageUrl,
      username: contact.username
    };

<<<<<<< HEAD
    const chat = await Chat.findOne({ users: { $in: [id, user._id] } });

=======
    const chat = await Chat.findOne({ users: { $in: [id, user._id] } }).populate('history');
>>>>>>> c6f7ef24456687d3c1d9b1474f0be8cbf58ab779
    const data = {
      _id: chat._id,
      contact: contactData,
      log: chat.history
    };
    if (chat) {
      res.status(200);
      res.json(data);
    } else {
      const err = new Error('Not found');
      err.status = 404;
      err.statusMessage = 'Not found';
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/send-message', async (req, res, next) => {
  const { id, message } = req.body;
  const { _id } = req.session.currentUser;
  try {
    const newMessage = {
      text: message,
      user: _id,
      date: Date.now
    }
    const createdMessage = await Message.create(newMessage);
    if (createdMessage) {
      const updateChat = await Chat.findByIdAndUpdate(id, { $push: { history: createdMessage } }, { new: true });
      if (updateChat) {
        SocketManager.messageReceived(updateChat._id);
        res.status(200);
        res.json(updateChat.history);
      } else {
        res.status(409);
        res.json({ message: "Can't send the message" });
      }
    } else {
      res.status(409);
      res.json({ message: "Can't create the message" });
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;
