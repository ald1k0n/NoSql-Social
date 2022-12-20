const express = require('express');
const Post = require('../db/postSchema');
const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');
const jwt = require('jsonwebtoken');

const app = express();

app.get('/getAllPosts', (req, res) => {
  Post.find({}, (posts) => {
    res.status(200).json(posts)
  });
})

app.post('/addPost', cookieJwtAuth, (req, res) => {
  const { title, content, image, date } = req.body;
  const token = req.cookies.token

  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  const post = new Post({
    userId: payload.id, title, content, image, date
  });
  post.save();
  res.status(200).json({
    message: "Пост успешно добавлен"
  });
});


module.exports = app;