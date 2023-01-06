const User = require('../db/userSchemas');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const express = require('express');
const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');

const app = express();

app.post('/register', async (req, res) => {
  const { login, password, birthday, avatar } = await req.body;
  const candidate = await User.findOne({ login });
  console.log(login, password)
  if (candidate) {
    res.status(409).json({
      message: "Пользователь уже существует"
    });
  }
  else {
    const salt = bcryptjs.genSaltSync(7);
    const user = new User({
      login,
      password: bcryptjs.hashSync(password, salt),
      birthday,
      avatar
    });

    try {
      await user.save();
      res.status(200).json({ message: "Успешно создан аккаунт" });
    }
    catch (err) {
      res.status(400).json({ message: err })
    }
  }
});

app.post('/login', async (req, res) => {
  const { login, password } = req.body;

  const candidate = await User.findOne({ login });
  if (candidate) {
    const pass = bcryptjs.compareSync(password, candidate.password);
    if (pass) {
      const token = jwt.sign({
        login: candidate.login,
        id: candidate._id,
        friends: candidate.friends,
        posts: candidate.posts,
        role: candidate.role,
        avatar: candidate.avatar
      }, 'socialNetwork', { expiresIn: '1h' });

      res.status(200).cookie("token", token, {
        httpOnly: true
      }).json({ message: token })

    } else {
      res.status(401).json({ message: "Пароли не совпадают" });
    }
  } else {
    res.status(401).json({
      message: "Пользователь с данным логином не существует"
    });
  }
});

app.get('/getMe', cookieJwtAuth, (req, res) => {
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });
  const { payload } = decodedToken;
  const { login, id, friends, posts, role, avatar } = payload;
  console.log(avatar)
  res.json({ login, id, friends, posts, role, avatar })
})

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.json('Удален')
})

module.exports = app;

