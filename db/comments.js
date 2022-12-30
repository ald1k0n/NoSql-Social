const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  comment: {
    type: String
  },
  postId: {
    type: String,
    require: true
  }
});

const CommentModel = new mongoose.model('comment', commentSchema);

module.exports = CommentModel;