const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://www.caduceosalud.es/wp-content/uploads/2013/09/silueta.png'
  },
  quote: {
    type: String
  },
  interests: {
    type: Array
  },
  personality: {
    type: Array
  },
  location: Array,
  matches: [{
    type: ObjectId,
    ref: 'User'
  }],
  contacts: [{
    type: ObjectId,
    ref: 'User'
  }],
  pending: [{
    type: ObjectId,
    ref: 'User'
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
