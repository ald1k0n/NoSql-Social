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
  const { title, content, image } = req.body;
  const token = req.cookies.token

  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  const post = new Post({
    userId: payload.id, title, content, image, date: Date.now()
  });
  post.save();
  res.status(200).json({
    message: "Пост успешно добавлен"
  });
});


//Фото поста не может быть удалено или изменено
app.put('/updatePost/:id', cookieJwtAuth, (req, res) => {
  const { title, content } = req.body;
  Post.updateOne({
    _id: req.params.id
  },
    {
      $set: {
        title, content
      }
    },
    err => {
      if (err) {
        res.status(500).json({ message: "Ошибка" })
      } else {
        res.status(204).json({ message: "Успешно обновлен пост" })
      }
    }
  )
});

app.delete('/deletePost/:id', cookieJwtAuth, (req, res) => {
  Post.deleteOne({
    _id: req.params.id
  }, err => {
    if (err) {
      res.status(500).json({
        message: "Ошибка"
      })
    }
    else {
      res.status(204).json({
        message: "Успешно удалён пост"
      });
    }
  })
})

module.exports = app;