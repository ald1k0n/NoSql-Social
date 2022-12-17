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
    {
      _id: {
        type: String,
        required: true
      },
      login: {
        type: String
      }
    }
  ],
  posts: [
    {
      _id: {
        type: String
      },
      title: {
        type: String
      },
      image: {
        type: String
      },
      content: {
        type: String
      }
    }
  ],
  role: {
    type: String,
    default: 'USER'
  }
});

const User = new mongoose.model("user", userSchema);

module.exports = User;