const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const parser = require('../helpers/file-upload');
const User = require('../models/user');
const { getGoogleAccountFromCode, urlGoogle } = require('../helpers/google-signup');
require('dotenv').config();

const { isLoggedIn, isNotLoggedIn, validationLoggin } = require('../helpers/middlewares');

router.get('/me', isLoggedIn(), (req, res, next) => {
  res.json(req.session.currentUser);
});

router.post('/login', isNotLoggedIn(), validationLoggin(), (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({
    username
  })
    .then((user) => {
      if (!user) {
        const err = new Error('Not Found');
        err.status = 404;
        err.statusMessage = 'Not Found';
        next(err);
      }
      if (bcrypt.compareSync(password, user.password)) {
        delete user.password;
        req.session.currentUser = user;
        return res.status(200).json(user);
      } else {
        const err = new Error('Unauthorized');
        err.status = 401;
        err.statusMessage = 'Unauthorized';
        next(err);
      }
    })
    .catch(next);
});

router.post('/signup', isNotLoggedIn(), validationLoggin(), (req, res, next) => {
  const { username, email, password, imageUrl, quote, interests, personality, location } = req.body;

  User.findOne({
    username
  }, 'username')
    .then((userExists) => {
      if (userExists) {
        const err = new Error('Unprocessable Entity');
        err.status = 422;
        err.statusMessage = 'username-not-unique';
        next(err);
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);

        // if (req.file) {
        //   imageUrl = req.file.url;
        // }
        const newUser = new User({
          username,
          email,
          password: hashPass,
          imageUrl,
          quote,
          interests,
          personality,
          location
        });

        return newUser.save().then(() => {
          // delete password missing
          req.session.currentUser = newUser;

          res.status(200).json(newUser);
        });
      }
    })
    .catch(next);
});

router.post('/logout', isLoggedIn(), (req, res, next) => {
  req.session.destroy();
  return res.status(204).send();
});

router.get('/private', isLoggedIn(), (req, res, next) => {
  res.status(200).json({
    message: 'This is a private message'
  });
});

router.get('/google-signup-url', async (req, res, next) => {
  const url = await urlGoogle();

  // 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&response_type=code&client_id=&redirect_uri=';

  // await url.url.replace('client_id=', `client_id=${process.env.clientID}`);
  // await url.url.replace('redirect_uri=', `redirect_uri=${process.env.callbackURL}`);

  console.log(typeof url);

  res.status(200).json({
    url
  });
});

router.get('/google-credentials', async (req, res, next) => {
  const { code } = req.query;
  const userData = await getGoogleAccountFromCode(code);

  console.log(userData);

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.id, salt);
    const newUser = {
      username: userData.email,
      name: userData.email,
      password: hashedPassword,
      email: userData.email,
      googleUser: true
    };
    const user = await User.find({ $and: [{ username: userData.email }, { email: userData.email }] });

    if (user.length) {
      req.session.currentUser = user[0];
    } else {
      const createdUser = await User.create(newUser);
      req.session.currentUser = createdUser;
    }
    return res.redirect('/profile');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
