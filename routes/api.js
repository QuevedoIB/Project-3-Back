const express = require('express');
const router = express.Router();

const User = require('../models/user');

const { isLoggedIn, isNotLoggedIn, validationLoggin } = require('../helpers/middlewares');
// POSIBLE PROBLEMA? SE PUEDE ACCEDER A TODA LA INFO DEL USER

router.get('/users', async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser._id;
    const allUsers = await User.find({_id: {$ne : currentUser}});

    if (!allUsers.length) {
      res.status(404);
      res.json({ message: 'Users not found' });
      return;
    }

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


router.get('/:id/contacts', isLoggedIn(), async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  try {
    if (id === _id) {
      const user = await User.findById(id);
      res.json(user.matches);
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

router.get('/:id/contacts/:contactId', isLoggedIn(), async (req, res, next) => {
  const { id, contactId } = req.params;
  const { _id } = req.session.currentUser;
  try {
    if (id === _id) {
      const user = await User.findById(id);
      const inContacts = user.matches.filter(e => e.equals(contactId));

      if (inContacts.length > 0) {
        const contact = await User.findById(contactId);
        const dataContact = {
          id: contact.id,
          username: contact.username,
          quote: contact.quote,
          interests: contact.interests
        };
        res.json(dataContact);
      } else {
        const err = new Error('Unauthorized');
        err.status = 401;
        err.statusMessage = 'Unauthorized';
        next(err);
      }
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

router.post('/search-people', isLoggedIn(), async (req, res, next) => {

  const { personality, location } = req.body;

  const currentUser = req.session.currentUser;

  try {
    if (personality) {

    } else {
      const foundUser = await User.findOne();
    }


    console.log(foundUser);

    if (foundUser) {
      res.status(200).json(foundUser);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
