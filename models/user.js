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
  preferences: {
    type: Array
  },
  matches: [{
    type: ObjectId,
    ref: 'User',
    required: true
  }],
  // personality: {
  //   type: Array
  // }

});

const User = mongoose.model('User', userSchema);

module.exports = User;