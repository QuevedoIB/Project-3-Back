const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');


router.post('/create', async (req, res, next) => {
  const { contactId } = req.body;
  const { _id } = req.session.currentUser;

  try {

    const isChat = await Chat.findOne({ users: { $in: [id, user._id] } });

    if (!isChat) {

      const contact = await user.findById(contactId);
      const contactData = {
        _id: contact._id,
        imageUrl: contact.imageUrl,
        username: contact.username
      }
      const newChat = {
        history: [],
        users: [_id, contactId]
      }
      const createdChat = await Chat.create(newChat);

      const data = {
        _id: createdChat._id,
        contact: contactData,
        log: createdChat.history
      };
      console.log(data);
      res.status(200);
      res.json(data)

    } else {
      res.status(409);
      res.json({ message: "Error creating the chat" })
    }
  } catch (error) {
    next(error)
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  const user = req.session.currentUser;
  try {
    const contact = await user.findById(id);
    const contactData = {
      _id: contact._id,
      imageUrl: contact.imageUrl,
      username: contact.username
    }

    const chat = await Chat.findOne({ users: { $in: [id, user._id] } });
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

  try {
    const updateChat = await Chat.findByIdAndUpdate(id, { history: { $push: message } }, { new: true });

    if (updateChat) {
      res.status(200);
      res.json(updateChat.history);
    } else {
      res.status(409);
      res.json({ message: "Can't send the message" })
    }

  } catch (error) {
    next(error);
  }

});

module.exports = router;