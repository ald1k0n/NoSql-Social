const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const User = require('../db/userSchemas');

app.put('/addFriend', cookieJwtAuth, (req, res) => {
  const token = req.cookies.token

  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  User.updateOne({ _id: payload.id }, {
    $push: {
      friends: {
        id: req.body.id
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

})


module.exports = app;