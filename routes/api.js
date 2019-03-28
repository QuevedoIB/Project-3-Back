const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');

const { isLoggedIn, isNotLoggedIn, validationLoggin } = require('../helpers/middlewares');
// POSIBLE PROBLEMA? SE PUEDE ACCEDER A TODA LA INFO DEL USER

router.get('/users', async (req, res, next) => {
  const currentUserId = req.session.currentUser._id;

  // const id = mongoose.Types.ObjectId(currentUserId);
  // const id = mongoose.mongo.BSONPure.ObjectID.fromHexString(currentUserId);

  try {
    const allUsers = await User.find({ $and: [{ _id: { $ne: currentUserId } }, { matches: { $nin: [currentUserId] } }, { pending: { $nin: [currentUserId] } }, { contacts: { $nin: [currentUserId] } }] });

    // if (!allUsers.length) {
    //   res.status(404);
    //   res.json({ message: 'Users not found' });
    //   return;
    // }

    let usersArr = allUsers.map(e => {
      e.email = '';
      e.password = '';
      return e;
    });

    res.status(200);
    res.json(usersArr);
  } catch (error) {
    next(error);
  }
});

router.post('/send-match', isLoggedIn(), async (req, res, next) => {
  const userToMatchId = req.body.id;

  const currentUser = req.session.currentUser;

  try {
    const userToMatch = await User.findById(userToMatchId);

    console.log(userToMatch);

    if (!userToMatch.matches.includes(currentUser._id) && !currentUser.pending.includes(userToMatchId)) {
      const pending = [userToMatchId, ...currentUser.pending];
      const matches = [currentUser._id, ...userToMatch.matches];
      await User.findByIdAndUpdate(userToMatchId, { $set: { matches } });
      await User.findByIdAndUpdate(currentUser._id, { $set: { pending } });
      res.status(200).json({ message: 'Match sent' });
    } else {
      res.status(409).json({ message: 'Match already sent' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
