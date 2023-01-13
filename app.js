const express = require('express');
const jsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { cookieJwtAuth } = require('./middleware/cookieJwtAuth');
const app = express();

const Messages = require('./db/messages');
const WSserver = require('express-ws')(app);
const aWss = WSserver.getWss();
const jwt = require('jsonwebtoken');
const User = require('./db/userSchemas');

// Routes
const auth = require('./controller/auth')
const post = require('./controller/post');
const userDto = require('./controller/user');
const comment = require('./controller/comment');
// const chat = require('./controller/chat');

mongoose.connect('mongodb://localhost:27017/social').then(() => console.log("Подключен")).catch(err => console.log(err))

// MiddleWare
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}));
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

// swaggerOptions
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Social Network API',
      version: '0.0.1'
    }
  },
  apis: ['./app.js', './controller/*.js']
};

const swaggerDocs = jsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
/**
 * @swagger
 * /:
 *   get:
 *     description: checks the lifetime
 *     responses:
 *       200:
 *         description: Returns token
 */
app.get('/', cookieJwtAuth, (req, res) => {
  res.status(200).json(req.cookies['token'])
});

app.ws('/online', (ws, req) => {
  const token = req.cookies.token
  const decodedToken = jwt.decode(token, {
    complete: true
  });

  const { payload } = decodedToken;

  ws.on('message', msg => {
    msg = JSON.parse(msg);
    switch (msg.method) {
      case 'online':
        ws.send(JSON.stringify({ ...payload, isOnline: true }))
        User.updateOne({ _id: payload.id }, {
          $set: {
            isOnline: true
          }
        }, (err) => {
          if (err) {
            console.log({
              msg: "Ошибка"
            })
          }
          else {
            console.log({
              msg: 'Онлайн'
            })
          }
        }
        )
        break;
      case 'offline':
        ws.send(JSON.stringify({
          message: 'offline'
        }));
        ws.send(JSON.stringify({ ...payload, isOnline: false }))
        User.updateOne({ _id: payload.id }, {
          $set: {
            isOnline: false
          }
        }, (err) => {
          if (err) {
            console.log({
              msg: "Ошибка"
            })
          }
          else {
            console.log({
              msg: 'Оффлайн'
            })
          }
        }
        )
        break;
      default:
        break;
    }
  })
})



app.listen(8080, () => console.log("Server started"))