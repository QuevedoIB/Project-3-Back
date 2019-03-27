const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

const { isLoggedIn, isNotLoggedIn, validationLoggin } = require('../helpers/middlewares');

router.post('/edit', isLoggedIn(), async (req, res, next) => {
  console.log('HOOOOOOOOLzzzzzzzzzzzzzzzzzzzzzzzzsdfewsdA');
  const { username, password, quote, interests, currentUser, currentPassword } = req.body;

  let filteredNoChanges = [username, quote, interests].filter(e => typeof e !== 'undefined');

  console.log(filteredNoChanges);

  try {
    if (username !== currentUser) {
      const userExists = await User.findOne({ username });

      if (userExists) {
        const err = new Error('Unprocessable Entity');
        err.status = 422;
        err.statusMessage = 'User already exists';
        next(err);
      }
    }

    const verifyUser = await User.findOne({ username });

    if (bcrypt.compareSync(currentPassword, verifyUser.password)) {
      let editedUser;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);
        editedUser = await User.findOneAndUpdate({ currentUser }, { $set: { username, password: hashPass, quote, interests } });
      } else {
        editedUser = await User.findOneAndUpdate({ currentUser }, { $set: { ...filteredNoChanges } });
      }

      console.log('HOOOOOOOOLzzzzzzzzzzzzzzzzzzzzzzzzsdfewsdA');

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
