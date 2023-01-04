const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { cookieJwtAuth } = require('./middleware/cookieJwtAuth');
const app = express();

const Messages = require('./db/messages');
const WSserver = require('express-ws')(app);
const aWss = WSserver.getWss();
const jwt = require('jsonwebtoken');

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
// app.use('/ws', chat);
app.get('/', cookieJwtAuth, (req, res) => {
  res.status(200).json(req.cookies['token'])
});

app.ws('/chat', (ws, req) => {
  ws.on('message', msg => {
    msg = JSON.parse(msg);
    const token = req.cookies.token
    const decodedToken = jwt.decode(token, {
      complete: true
    });

    const { payload } = decodedToken;

    switch (msg.method) {
      case 'connect': {
        ws.send(`Пользователь вошел в сеть`);

        Messages.find({ secondUserId: msg.secondId, currentUserId: payload.id }, (err, message) => {
          ws.send(message);
        });
        connectionHandler(ws, msg);
        break;
      }
      case 'sendMessage': {
        const { secondId, message } = req.body;
        const msg = new Messages({
          currentUserId: payload.id,
          secondUserId: secondId,
          message
        });
        msg.save();
        broadcastConnection(ws, msg);
        break;
      }
    }
  })
});

const connectionHandler = (ws, msg) => {
  ws.user = msg.user;
  console.log(ws.user, msg.user)
  broadcastConnection(ws, msg);
}

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach(client => {
    if (client.id === msg.id) {
      client.send(JSON.stringify({
        msg
      }))
    }
  })
}




app.listen(8080, () => console.log("Server started"))