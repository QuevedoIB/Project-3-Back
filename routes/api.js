const express = require('express');
const router = express.Router();

const User = require('../models/User');


//POSIBLE PROBLEMA? SE PUEDE ACCEDER A TODA LA INFO DEL USER


router.get('/users', async (req, res, next) => {
  try {
    const allUsers = await User.find();
    if (!allUsers.length) {
      res.status(404);
      res.json({ message: 'Users not found' });
      return;
    }
    res.json(allUsers);
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200);

    //coger solo los campos públicos
    const dataUser ={
      username: user.username,
      quote: user.quote,
      preferences: user.preferences
    }
    res.json({ message: 'User found', data: dataUser });
  } catch (error) {
    next(error);
  }
});

