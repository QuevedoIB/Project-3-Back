const express = require('express');
const router = express.Router();

const User = require('../models/user');

const { isLoggedIn, isNotLoggedIn, validationLoggin } = require('../helpers/middlewares');
// POSIBLE PROBLEMA? SE PUEDE ACCEDER A TODA LA INFO DEL USER

// router.get('/users', async (req, res, next) => {
//   try {
//     const allUsers = await User.find();
//     if (!allUsers.length) {
//       res.status(404);
//       res.json({ message: 'Users not found' });
//       return;
//     }
//     res.json(allUsers);
//   } catch (error) {
//     next(error);
//   }
// });

// router.get('/users/:id', async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const user = await User.findById(id);
//     res.status(200);

//     //coger solo los campos públicos
//     const dataUser = {
//       id: user.id,
//       username: user.username,
//       quote: user.quote,
//       preferences: user.preferences
//     }
//     res.json({ message: 'User found', data: dataUser });
//   } catch (error) {
//     next(error);
//   }
// });

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
