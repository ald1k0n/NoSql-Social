const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const { cookieJwtAuth } = require('./middleware/cookieJwtAuth');
// Routes
const auth = require('./controller/auth')

mongoose.connect('mongodb://localhost:27017/social').then(() => console.log("Подключен")).catch(err => console.log(err))

const app = express();

// MiddleWare
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(passport.initialize());
require('./middleware/passport')(passport)

// routes
app.use('/auth', auth);

app.get('/', cookieJwtAuth, (req, res) => {
  res.status(200).json("Test token auth")
})
app.listen(8080, () => console.log("Server started"))