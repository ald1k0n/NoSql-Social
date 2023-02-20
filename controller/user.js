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
 *     parameters:
 *        - in: path
 *          name: friendId
 *          type: string
 *          required: true
 *     responses:
 *        401: 
 *           description: Unauthorized
 *        200:
 *           description: Пользователь добавлен в друзья
 */
app.put('/addFriend/:id', cookieJwtAuth, async (req, res) => {
  const token = req.cookies.token

  const decodedToken = jwt.decode(token, {
    complete: true
  });
  const { payload } = decodedToken;

  const friend = await User.findOne({ _id: req.params.id }, { login: 1, avatar: 1 });

  if (friend) {
    const friendData = {
      id: friend._id.toString(),
      login: friend.login,
      avatar: friend.avatar
    }
    User.updateOne({ _id: payload.id }, {
      $push: {
        friends: friendData
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
  }


});
/**
 * @swagger
 * /user/removeFriend/{id}:
 *   put:
 *     description: Удаление из друзей
 *     parameters:
 *        - in: path
 *          name: friendId
 *          type: string
 *          required: true
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
  console.log(payload.id);

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
app.get('/allUsers', (req, res) => {
  User.find({}, (err, users) => !err ? res.status(200).json(users) : res.status(404).json(err))
});

/**
 * @swagger
 * /user/updateProfile:
 *   put:
 *     description: Обновление пользовательского профиля
 *     parameters:
 *        - in: body
 *          name: updateBody
 *          description: Фотографию через upload image грузить и сохранять в переменную и передать ссылку сюда
 *          schema:
 *            type: object
 *            properties:
 *              avatar:
 *                type: string
 *              birthday:
 *                type: string
 *     responses:
 *        401: 
 *           description: Unauthorized
 *        204:
 *           description: Успешно удален из друзей
 *        500:
 *           description: Не удалось удалить из друзей
 */
app.put('/updateProfile', cookieJwtAuth, (req, res) => {
  const token = req.cookies.token
  const { image, birthday } = req.body;
  const decodedToken = jwt.decode(token, {
    complete: true
  });
  const { payload } = decodedToken;

  User.updateOne(
    {
      _id: payload.id
    },
    {
      $set: {
        avatar: image,
        birthday: birthday
      }
    }, err => {
      if (err) {
        res.status(400).json({ message: "Ошибка обновления профиля" })
      } else {
        res.status(200).json({ message: "Профиль успешно обновлен" })
      }
    }
  )
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     description: Получение пользователя по id
 *     parameters:
 *        - in: path
 *          name: userId
 *          type: string
 *          required: true
 *     responses:
 *        404: 
 *           description: Что-то пошло не так
 *        200:
 *           description: User
 */
app.get('/:id', (req, res) => {
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      res.json({ msg: "Что-то пошло не так" })
    }
    else {
      res.status(200).json(user);
    }
  })
});

/**
 * @swagger
 * /user/find/{login}:
 *   get:
 *     description: Получение пользователя по частям логина
 *     parameters:
 *        - in: path
 *          name: userId
 *          type: string
 *          required: true
 *     responses:
 *        404: 
 *           description: Что-то пошло не так
 *        200:
 *           description: Users
 */
app.get('/find/:username', (req, res) => {
  User.find({
    login: {
      $regex: req.params.username,
      $options: 'i'
    }
  }, (err, user) => !err ? res.status(200).json(user) : res.status(404).json({ err }))
})



module.exports = app;