'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const chatSchema = new Schema({
  history: [{
    type: ObjectId,
    ref: 'Message'
  }],
  users: [{
    type: ObjectId,
    ref: 'User',
    required: true
  }]
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;