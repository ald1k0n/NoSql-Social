const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const User = require('../db/userSchemas');

app.put('/addFriend/:id', cookieJwtAuth, (req, res) => {
  const token = req.cookies.token

  const decodedToken = jwt.decode(token, {
    complete: true
  });
  const { payload } = decodedToken;
  User.updateOne({ _id: payload.id }, {
    $push: {
      friends: {
        id: req.params.id
      }
    }
  }, (err) => {
    if (err) {
      res.status(500).json({
        message: "Произошло ошибка"
      })
    }
    res.status(200).json({
      message: "Всё ок"
    })
  })
});

app.put('/removeFriend/:id', cookieJwtAuth, (req, res) => {
  const token = req.cookies.token

  const decodedToken = jwt.decode(token, {
    complete: true
  });
  const { payload } = decodedToken;
  User.updateOne({
    _id: payload.id
  },
    {
      $pull: {
        friends: {
          id: req.params.id
        }
      }
    },
    err => {
      if (err) {
        res.status(500).json({ message: "Не удалось удалить из друзей" })
      } else {
        res.status(204).json({ message: "Успешно удален из друзей" })
      }
    }
  )
});


module.exports = app;