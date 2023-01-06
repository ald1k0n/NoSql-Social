const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const User = require('../db/userSchemas');
/**
 * @swagger
 * /user/addFriend/{id}:
 *   put:
 *     description: Добавить в друзья
 *     responses:
 *        401: 
 *           description: Unauthorized
 *        200:
 *           description: Пользователь добавлен в друзья
 */
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
/**
 * @swagger
 * /user/removeFriend/{id}:
 *   put:
 *     description: Удаление из друзей
 *     responses:
 *        401: 
 *           description: Unauthorized
 *        204:
 *           description: Успешно удален из друзей
 *        500:
 *           description: Не удалось удалить из друзей
 */
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