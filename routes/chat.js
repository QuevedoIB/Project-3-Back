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

      const newChatUser = {
        chatId: data._id,
        numberMessages: 0
      };
      const currentUser = await User.findByIdAndUpdate(_id, { $push: { readMessages: newChatUser } }, { new: true });
      const contactUser = await User.findByIdAndUpdate(contactData._id, { $push: { readMessages: newChatUser } }, { new: true });

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

    const chat = await Chat.findOne({ $and: [{ users: { $in: [id] } }, { users: { $in: [user._id] } }] }).populate('history');

    const contactData = {
      _id: contact._id,
      imageUrl: contact.imageUrl,
      personalImage: '',
      username: contact.username
    };

    if (chat.enabledImages) {
      contactData.personalImage = contact.personalImage;
    }

    const data = {
      _id: chat._id,
      contact: contactData,
      log: chat.history,
      enabledImagesRequest: chat.enabledImagesRequest,
      enabledImages: chat.enabledImages
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
  const { id, message, date } = req.body;
  const { _id } = req.session.currentUser;

  try {
    // let time = new Date();
    // const dd = String(time.getDate()).padStart(2, '0');
    // const mm = String(time.getMonth() + 1).padStart(2, '0');
    // let hours = String(time.getHours());
    // let minutes = String(time.getMinutes());

    // if (minutes < 10) {
    //   minutes = `0${minutes}`;
    // } else if (hours < 10) {
    //   hours = `0${hours}`;
    // }

    // time = `${hours}:${minutes} - ${dd}/${mm}`;

    const newMessage = {
      text: message,
      user: _id,
      date
    };

    const createdMessage = await Message.create(newMessage);

    if (createdMessage) {
      const updateChat = await Chat.findByIdAndUpdate(id, { $push: { history: createdMessage._id } }, { new: true }).populate('history');
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

router.post('/update-number-messages', async (req, res, next) => {
  const { chatId, numberMessages } = req.body;
  const { _id } = req.session.currentUser;

  try {
    const user = await User.findById(_id).lean();
    const userChatArray = user.readMessages.map(e => {
      if (e.chatId.equals(chatId)) {
        e.numberMessages = numberMessages;
      }
      return e;
    });
    const userUpdated = await User.findByIdAndUpdate(_id, { readMessages: userChatArray }, { new: true });

    if (userUpdated) {
      req.session.currentUser = userUpdated;
      res.status(200).json(userUpdated);
    } else {
      res.status(409).json({ message: 'User cannot be updated' });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/enable-images-request', async (req, res, next) => {
  const { id, contactId } = req.body;

  try {
    const chat = await Chat.findById(id);

    const checker = chat.enabledImagesRequest.some(e => e.equals(contactId));

    let enableImagesChat;

    if (checker) {
      enableImagesChat = await Chat.findByIdAndUpdate(id, { $pull: { enabledImagesRequest: contactId } }, { new: true });
    } else {
      enableImagesChat = await Chat.findByIdAndUpdate(id, { $push: { enabledImagesRequest: contactId } }, { new: true });
    }

    if (enableImagesChat) {
      SocketManager.enableImagesRequest(enableImagesChat._id);
      res.status(200);
      res.json(enableImagesChat.enabledImagesRequest);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/on-typing', async (req, res, next) => {
  const { chatId, userTypingId } = req.body;

  await SocketManager.onTyping(chatId, userTypingId);
  res.status(200);
});

router.post('/accept-request', async (req, res, next) => {
  const { id } = req.body;
  const { _id } = req.session.currentUser;

  try {
    const chat = await Chat.findById(id);

    const newRequests = chat.enabledImagesRequest.filter(e => !e.equals(_id));
    const updatedChat = await Chat.findByIdAndUpdate(id, { $set: { enabledImages: true, enabledImagesRequest: newRequests } }, { new: true });

    if (updatedChat) {
      SocketManager.enableImagesRequest(updatedChat._id);
      res.status(200);
      res.json(updatedChat);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/decline-request', async (req, res, next) => {
  const { id } = req.body;
  const { _id } = req.session.currentUser;

  try {
    const chat = await Chat.findById(id);

    const newRequests = chat.enabledImagesRequest.filter(e => !e.equals(_id));
    const updatedChat = await Chat.findByIdAndUpdate(id, { $set: { enabledImages: false, enabledImagesRequest: newRequests } }, { new: true });

    if (updatedChat) {
      SocketManager.enableImagesRequest(updatedChat._id);
      res.status(200);
      res.json(updatedChat);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/disable-images-request', async (req, res, next) => {
  const { id } = req.body;

  try {
    const disabledImagesChat = await Chat.findByIdAndUpdate(id, { $set: { enabledImagesRequest: [], enabledImages: false } }, { new: true });

    if (disabledImagesChat) {
      SocketManager.enableImagesRequest(disabledImagesChat._id);
      res.status(200);
      res.json(disabledImagesChat.enabledImagesRequest);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
