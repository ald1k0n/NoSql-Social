const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  login: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true,
    min: 6
  },
  avatar: {
    type: String,
    default: null
  },
  birthday: {
    type: String
  },
  friends: [

  ],

  role: {
    type: String,
    default: 'USER'
  }
});

const User = new mongoose.model("user", userSchema);

module.exports = User;