const express = require('express');
const Post = require('../db/postSchema');
const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage });
/**
 * @swagger
 * /posts/getAllPosts:
 *   get:
 *     description: Получение всех постов
 *     responses:
 *        200: 
 *           description: Посты
 *        404:
 *           description: Что то пошло не так
 */
app.get('/getAllPosts', (req, res) => {
  Post.find({}, (err, posts) => {
    if (!err) {
      res.status(200).json(posts)
    } else {
      res.status(404).json({ msg: "Что то пошло не так" })
    }

  });
});

/**
 * @swagger
 * /posts/uploadImage:
 *   post:
 *     description: Загрузка изображения на сервер
 *     parameters:
 *        - in: formData
 *          name: image
 *          type: file
 *          description: Изображение на сервер
 *     responses:
 *        200: 
 *           description: image
 */
app.post('/uploadImage', upload.single('image'), (req, res) => {
  console.log(req.file)
  res.json({
    image: `http://localhost:8080/image/${req.file.filename}`
  })
})

/**
 * @swagger
 * /posts/addPost:
 *   post:
 *     description: Создание поста
 *     parameters:
 *        - in: body
 *          name: post
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *              content:
 *                type: string
 *              image:
 *                type: string
 *     responses:
 *        200: 
 *           description: image
 *        401:
 *           description: Unauthorized
 *
 */
app.post('/addPost', cookieJwtAuth, (req, res) => {
  const { title, content, image } = req.body;
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  const post = new Post({
    userId: payload.id, login: payload.login, title, content, image, date: Date.now()
  });
  post.save();
  res.status(200).json({
    message: "Пост успешно добавлен"
  });
});


//Фото поста не может быть удалено или изменено
/**
 * @swagger
 * /posts/updatePost/{id}:
 *   put:
 *     description: Обновление поста (Фото поста не может быть удалено или изменено)
 *     parameters:
 *        - in: path
 *          name: postId
 *          type: string
 *        - in: body
 *          name: post
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *              content:
 *                type: string
 *     responses:
 *        500: 
 *           description: Ошибка
 *        204:
 *           description: Успешно обновлен пост
 */
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


/**
 * @swagger
 * /posts/deletePost/{id}:
 *   delete:
 *     description: Удаление поста
 *     parameters:
 *        - in: path
 *          name: postId
 *          type: string
 *          required: true
 *     responses:
 *        500: 
 *           description: Ошибка
 *        204:
 *           description: Успешно удалён пост
 */
app.delete('/deletePost/:id', async (req, res) => {
  await Post.deleteOne({
    _id: req.params.id,
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
  }).clone()
});

/**
 * @swagger
 * /posts/post/{id}:
 *   get:
 *     description: Получение поста по id
 *     parameters:
 *        - in: path
 *          name: postId
 *          type: string
 *          required: true
 *     responses:
 *        404: 
 *           description: Что-то пошло не так
 *        200:
 *           description: Пост
 */
app.get('/post/:id', async (req, res) => {
  await Post.findOne({ _id: req.params.id }, (err, post) => {
    if (!err) {
      res.status(200).json(post)
    } else {
      res.status(404).json({ msg: "Что-то пошло не так" })
    }
  }).clone().catch(err => console.log(err))
});

/**
 * @swagger
 * /posts/myPosts:
 *   get:
 *     description: Получение своих постов 
 *     responses:
 *        404: 
 *           description: Что-то пошло не так
 *        200:
 *           description: Пост
 */
app.get('/myPosts', async (req, res) => {
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  await Post.find({ _id: payload.id }, (err, post) => {
    if (!err) {
      res.status(200).json(post)
    } else {
      res.status(404).json({ msg: 'Что то пошло не так' })
    }
  })
});

module.exports = app;