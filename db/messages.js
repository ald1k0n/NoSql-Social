const { Schema, model } = require('mongoose');

const message = new Schema({
  currentUserId: {
    type: String,
    require: true
  },
  secondUserId: {
    type: String,
    require: true
  },
  message: {
    type: String
  }
});

const Messages = new model('message', message);

module.exports = Messages;