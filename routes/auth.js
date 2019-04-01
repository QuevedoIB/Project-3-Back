const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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

router.post('/signup', isNotLoggedIn(), validationLoggin(), async (req, res, next) => {
  const { username, email, password, imageUrl } = req.body;

  console.log(username, email, password);

  try {
    const userByUsername = await User.findOne({ username });

    if (userByUsername) {
      return res.status(409).json({ message: 'Username taken' });
    } else {
      const userByEmail = await User.findOne({ email });

      if (userByEmail) {
        res.status(409).json({ message: 'Email already in use' });
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);

        // if (req.file) {
        //   imageUrl = req.file.url;
        // }
        const newUser = {
          username,
          email,
          password: hashPass
        };

        console.log(newUser);

        const createdUser = await User.create(newUser);

        const publicData = {
          username,
          email,
          interests: [],
          quote: '',
          location: [],
          personality: [],
          matches: [],
          contacts: []
        };

        req.session.currentUser = createdUser;

        res.status(200).json(publicData);
      }
    }
  } catch (error) {
    next(error);
  }

  // User.findOne({
  //   username
  // }, 'username')
  //   .then((userExists) => {
  //     if (userExists) {
  //       return res.status(422).json({ message: 'User already exists' });
  //     } else {
  //       const salt = bcrypt.genSaltSync(10);
  //       const hashPass = bcrypt.hashSync(password, salt);

  //       // if (req.file) {
  //       //   imageUrl = req.file.url;
  //       // }
  //       const newUser = new User({
  //         username,
  //         email,
  //         password: hashPass,
  //         quote,
  //         interests,
  //         personality,
  //         location
  //       });

  //       return newUser.save().then(() => {
  //         // delete password missing
  //         req.session.currentUser = newUser;

  //         res.status(200).json(newUser);
  //       });
  //     }
  //   })
  //   .catch(error => next(error));
});

router.post('/complete-profile', isLoggedIn(), async (req, res, next) => {
  const { quote, interests, personality, location } = req.body;

  const { _id } = req.session.currentUser;

  try {
    const updatedUser = await User.findByIdAndUpdate(_id, { location, interests, quote, personality }, { new: true });

    req.session.currentUser = updatedUser;
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
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

  res.status(200).json({
    url
  });
});

router.get('/google-credentials', async (req, res, next) => {
  const { code } = req.query;
  const userData = await getGoogleAccountFromCode(code);

  try {
    const user = await User.find({ $and: [{ username: userData.email }, { email: userData.email }] });

    if (user.length) {
      req.session.currentUser = user[0];
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(userData.id, salt);
      const newUser = {
        username: userData.email,
        name: userData.email,
        password: hashedPassword,
        email: userData.email,
        googleUser: true
      };
      const createdUser = await User.create(newUser);
      req.session.currentUser = createdUser;
    }
    return res.redirect('http://localhost:3000/');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
