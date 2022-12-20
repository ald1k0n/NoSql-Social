const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  title: {
    type: String,
    require: true
  },
  content: {
    type: String
  },
  image: {
    type: String
  },
  date: {
    type: Date
  }
});

const Post = new mongoose.model('post', postSchema);

module.exports = Post;
