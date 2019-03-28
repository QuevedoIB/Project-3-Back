const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

const { isLoggedIn, isNotLoggedIn, validationLoggin } = require('../helpers/middlewares');

// router.post('/edit', isLoggedIn(), (req, res, next) => {
//   console.log(req.body);
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
        console.log(password, 'HAY CONTASEÑAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
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

module.exports = router;
