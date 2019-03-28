const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

const { isLoggedIn, isNotLoggedIn, validationLoggin } = require('../helpers/middlewares');

// router.post('/edit', isLoggedIn(), (req, res, next) => {

//   res.status(200).json({ message: req.body });
// });

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

  console.log(userToAddId);

  const currentUserId = req.session.currentUser._id;

  try {
    const user = await User.findById(currentUserId);

    console.log(user.contacts, 'CONTAAAAAAAAAAAAAAAAAAAAACTS');

    if (!user.contacts.includes(userToAddId)) {
      const contacts = [userToAddId, ...user.contacts];
      const userWithContact = await User.findByIdAndUpdate(currentUserId, { $set: { contacts } });
      req.session.currentUser = userWithContact;
      res.status(200).json(userWithContact);
    }

    res.status(409).json({ message: 'User already added' });
  } catch (error) {
    next(error);
  }
});

router.post('/decline-contact/:userToDeclineId', isLoggedIn(), async (req, res, next) => {
  const { userToDeclineId } = req.params;

  console.log(userToDeclineId);

  const currentUserId = req.session.currentUser._id;
  const currentUser = req.session.currentUser;

  try {
    console.log(currentUser.matches);

    if (currentUser.matches.includes(userToDeclineId)) {
      const userToDecline = await User.findById(userToDeclineId);

      const pending = userToDecline.pending.filter(e => e !== currentUserId);

      const matches = currentUser.matches.filter(e => e !== userToDeclineId);

      const userWithoutInvite = await User.findByIdAndUpdate(currentUserId, { $set: { matches } }, { new: true });

      await User.findByIdAndUpdate(userToDeclineId, { $set: { pending } }, { new: true });

      req.session.currentUser = userWithoutInvite;
      res.status(200).json(userWithoutInvite);
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

module.exports = router;
