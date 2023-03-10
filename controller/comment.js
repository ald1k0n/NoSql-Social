const Comment = require('../db/comments');
const express = require('express');
const jwt = require('jsonwebtoken');
const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');

const app = express();

app.get('/:id', (req, res) => {
  Comment.findOne({ _id: req.params.id }, (err, comment) => {
    if (err) {
      res.status(404).json(err)
    } else {
      res.json(comment)
    }
  })
})

// Получение комментариев по id поста
/**
 * @swagger
 * /comments/comment/{id}:
 *   get:
 *     description: Получение комментариев по id поста
 *     parameters:
 *      - in: path
 *        name: commentId
 *        type: string
 *        required: true
 *        description: Получение комментариев по id поста
 *        
 *            
 *     responses:
 *        200: 
 *           description: Комментарии
 *        400:
 *           description: Что то пошло не так
 */
app.get('/comment/:id', (req, res) => {
  Comment.find({ postId: req.params.id }, (err, com) => {
    if (!err) {
      res.status(200).json(com);
    } else {
      res.status(400).json("Что то пошло не так")
    }

  }).sort({
    _id: -1
  })
});
// Добавление комментария под пост
/**
 * @swagger
 * /comments/comment:
 *   post:
 *     description: Добавление комментария под пост
 *     parameters:
 *      - in: body
 *        name: comment
 *        description: Добавление комментария под пост
 *        schema:
 *          type: object
 *          properties:
 *            comment: 
 *              type: string
 *            postId:
 *              type: string
 *     responses:
 *        200: 
 *           description: Коммент добавлен
 *        401:
 *           description: Unauthorized
 */
app.post('/comment', cookieJwtAuth, (req, res) => {
  const { comment, postId } = req.body;
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;
  const com = new Comment({
    userId: payload.id,
    user: payload.login,
    comment,
    postId
  });
  com.save();
  res.status(200).json({
    message: "Коммент добавлен"
  })
});

//Удаление комментария под постом
/**
 * @swagger
 * /comments/comment/{id}:
 *   delete:
 *     description: Удаление комментария под постом
 *     parameters:
 *      - in: path
 *        name: commentId
 *        type: string
 *        required: true
 *        description: Удаление комментария под постом
 *     responses:
 *        200: 
 *           description: Удален успешно
 *        401:
 *           description: Unauthorized
 *        404:
 *           description: Ошибка
 */
app.delete('/comment/:id', (req, res) => {
  const { comment } = req.body;
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  Comment.deleteOne({
    _id: req.params.id,
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
/**
 * @swagger
 * /comments/comment/{id}:
 *   put:
 *     description: Обновление комментария под постом
 *     parameters:
 *     - in: path
 *       name: commentId
 *       type: string
 *       required: true
 *     - in: body
 *       name: commentUpdate
 *       schema:
 *          type: object
 *          properties:
 *              comment:
 *                type: string
 *     responses:
 *        200: 
 *           description: Обновлен
 *        401:
 *           description: Unauthorized
 *        404:
 *           description: Ошибка
 */
app.put('/comment/:id', cookieJwtAuth, (req, res) => {
  const { comment } = req.body;
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  Comment.updateOne({
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