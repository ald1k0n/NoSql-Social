const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { cookieJwtAuth } = require('./middleware/cookieJwtAuth');

// Routes
const auth = require('./controller/auth')
const post = require('./controller/post');
const userDto = require('./controller/user');
const comment = require('./controller/comment');

mongoose.connect('mongodb://localhost:27017/social').then(() => console.log("Подключен")).catch(err => console.log(err))

const app = express();

// MiddleWare
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/image', express.static("public/uploads"))

// routes
app.use('/auth', auth);
app.use('/posts', post)
app.use('/user', userDto);
app.use('/comments', comment);

app.get('/', cookieJwtAuth, (req, res) => {
  res.status(200).json(req.cookies['token'])
});


app.listen(8080, () => console.log("Server started"))