const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

const { isLoggedIn, isNotLoggedIn, validationLoggin } = require('../helpers/middlewares');

router.post('/edit', isLoggedIn(), async (req, res, next) => {
  const { username, password, quote, interests, currentPassword } = req.body;

  const { currentUser } = req.session;

  try {
    if (username !== currentUser.username) {
      const userExists = await User.findOne({ username });

      if (userExists) {
        const err = new Error('Unprocessable Entity');
        err.status = 422;
        err.statusMessage = 'User already exists';
        next(err);
      }
    }

    if (bcrypt.compareSync(currentPassword, currentUser.password)) {
      let editedUser;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);

        editedUser = await User.findOneAndUpdate({ username: currentUser.username }, { $set: { username, password: hashPass, quote, interests } }, { new: true });
      } else {
        editedUser = await User.findOneAndUpdate({ username: currentUser.username }, { $set: { username, quote, interests } }, { new: true });
      }

      req.session.currentUser = editedUser;

      return res.status(200).json(editedUser);
    } else {
      const err = new Error('Unprocessable Entity');
      err.status = 422;
      err.statusMessage = 'Incorrect password';
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/add-contact/:userToAddId', isLoggedIn(), async (req, res, next) => {
  const { userToAddId } = req.params;

  const currentUserId = req.session.currentUser._id;

  try {
    const user = await User.findById(currentUserId);

    if (!user.contacts.includes(userToAddId)) {
      const contacts = [userToAddId, ...user.contacts];
      await User.findByIdAndUpdate(currentUserId, { $pull: { matches: userToAddId } });
      await User.findByIdAndUpdate(userToAddId, { $pull: { pending: currentUserId } });
      await User.findByIdAndUpdate(userToAddId, { $push: { contacts: currentUserId } });
      const userWithContact = await User.findByIdAndUpdate(currentUserId, { $push: { contacts: userToAddId } });
      req.session.currentUser = userWithContact;

      res.status(200).json(userWithContact);
    } else {
      res.status(409).json({ message: 'User already added' });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/decline-contact/:userToDeclineId', isLoggedIn(), async (req, res, next) => {
  const { userToDeclineId } = req.params;

  const currentUserId = req.session.currentUser._id;
  const currentUser = req.session.currentUser;

  try {
    if (currentUser.matches.includes(userToDeclineId)) {
      const userWithoutMatch = await User.findByIdAndUpdate(currentUserId, { $pull: { matches: userToDeclineId } }, { new: true });

      await User.findByIdAndUpdate(userToDeclineId, { $pull: { pending: currentUserId } }, { new: true });

      req.session.currentUser = userWithoutMatch;
      res.status(200).json(userWithoutMatch);
    } else {
      res.status(409).json({ message: 'User already declined' });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/matches', isLoggedIn(), async (req, res, next) => {
  const { _id } = req.session.currentUser;

  try {
    const user = await User.findById(_id).populate('matches');

    const dataMatches = user.matches.map(e => {
      const object = {
        _id: e._id,
        username: e.username,
        imageUrl: e.imageUrl,
        quote: e.quote,
        interests: e.interests
      };
      return object;
    });

    res.status(200);
    res.json(dataMatches);
  } catch (error) {
    next(error);
  }
});

router.get('/contacts', isLoggedIn(), async (req, res, next) => {
  const { _id } = req.session.currentUser;

  try {
    const user = await User.findById(_id).populate('contacts');

    const dataContacts = user.contacts.map(e => {
      const object = {
        _id: e._id,
        username: e.username,
        imageUrl: e.imageUrl,
        quote: e.quote,
        interests: e.interests
      };
      return object;
    });

    res.status(200);
    res.json(dataContacts);
  } catch (error) {
    next(error);
  }
});

router.get('/contact/:contactId', isLoggedIn(), async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await User.findById(contactId);

    if (contact) {
      const dataContacts = {
        _id: contact._id,
        username: contact.username,
        imageUrl: contact.imageUrl,
        quote: contact.quote,
        interests: contact.interests
      };
      res.status(200);
      res.json(dataContacts);
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/contact/delete', isLoggedIn(), async (req, res, next) => {
  const { userId, contactId } = req.body;
  const { _id } = req.session.currentUser;
  try {
    if (userId === _id) {
      const user = await User.findById(_id);
      const userWithoutContact = await User.findByIdAndUpdate(userId, { $pull: { contacts: contactId } });
      await User.findByIdAndUpdate(contactId, { $pull: { contacts: userId } });
      res.status(200).json(userWithoutContact);
    } else {
      const err = new Error('Unauthorized');
      err.status = 401;
      err.statusMessage = 'Unauthorized';
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
