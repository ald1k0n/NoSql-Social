const Messages = require('../db/messages');
const express = require('express');
const app = express();
const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');
const jwt = require('jsonwebtoken');

app.get('/:id', cookieJwtAuth, async (req, res) => {
  const token = req.cookies.token

  const decodedToken = jwt.decode(token, {
    complete: true
  });
  const { payload } = decodedToken;

  Messages.find({
    $or: [
      { currentUserId: payload.id, secondUserId: req.params.id },
      { currentUserId: req.params.id, secondUserId: payload.id }]
  }, (err, messages) => {
    if (!err) {
      res.status(200).json(messages)
    }
    else {
      res.status(500).json(err)
    }
  })
});

module.exports = app;