const Comment = require('../db/comments');
const express = require('express');
const jwt = require('jsonwebtoken');
const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');

const app = express();

// Получение комментариев по id поста
app.get('/comment/:id', async (req, res) => {
  await Comment.find({ postId: req.params.id }, (com) => {
    res.status(200).json(com);
  })
});
// Добавление комментария под пост 
app.post('/comment', cookieJwtAuth, (req, res) => {
  const { comment, postId } = req.body;
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;
  const com = new Comment({
    userId: payload.id,
    comment,
    postId
  });
  com.save();
  res.status(200).json({
    message: "Коммент добавлен"
  })
});

//Удаление комментария под постом
app.delete('/comment/:id', cookieJwtAuth, async (req, res) => {
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  await Comment.deleteOne({
    postId: req.params.id,
    userId: payload.id
  }, err => {
    if (err) {
      res.status(404).json({
        msg: "Ошибка"
      })
    }
    else {
      res.status(200).json({
        msg: "Удален успешно"
      })
    }
  })
});

// Обновление комментария под постом
app.put('/comment/:id', cookieJwtAuth, async (req, res) => {
  const { comment } = req.body;
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  await Comment.updateOne({
    _id: req.params.id,
    userId: payload.id
  },
    {
      $set: {
        comment
      }
    }, err => {
      if (err) {
        res.status(404).json({ msg: err })
      }
      else {
        res.status(200).json({
          msg: "Обновлен"
        })
      }
    })
});

module.exports = app;