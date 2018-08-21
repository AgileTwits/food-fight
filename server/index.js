require('dotenv').config();

//
// ─── MODULE IMPORTS ─────────────────────────────────────────────────────
//
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const socket = require('socket.io');
const db = require('../database-postgresql/models/index');

//
// ─── ROUTE IMPORTS ─────────────────────────────────────────────────────
//

const auth = require('./routes/auth');
const email = require('./routes/email');
const rooms = require('./routes/rooms');
const extApi = require('./routes/ext_api');

const app = express();

//
// ─── MIDDLEWARE ─────────────────────────────────────────────────────
//

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/../react-client/dist`));
app.use(morgan('dev'));

//
// ─── ROUTE MIDDLEWARE ─────────────────────────────────────────────────────
//

app.use(auth);
app.use(email);
app.use(rooms);
app.use(extApi);

// ────────────────────────────────────────────────────────────────────────────────


// Sets up default case so that any URL not handled by the Express Router
// will be handled by the React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../react-client/dist/index.html`));
});

// create the tables based on the models and once done, listen on the given port
db.models.sequelize.sync().then(() => {
  const server = app.listen(process.env.PORT || 3000, () => {
    console.log('listening on port', process.env.PORT || 3000);
  });

  // Server-side socket events
  const io = socket(server);
  io.on('connection', (newSocket) => {
    console.log('made socket connection', newSocket.id);

    newSocket.on('chat', (data) => {
      console.log('Received chat!', data);
      io.sockets.emit('chat', data);
    });

    newSocket.on('nominate', (data) => {
      console.log('Nomination received!', data);
      io.sockets.emit('nominate', data);
    });

    newSocket.on('vote', (data) => {
      console.log('Received vote!', data);
      io.sockets.emit('vote', data.roomID);
    });

    newSocket.on('veto', (data) => {
      console.log('Received veto!', data);
      io.sockets.emit('veto', data.roomID);
    });

    newSocket.on('join', (roomID) => {
      console.log('Received new member!', roomID);
      io.sockets.emit('join', roomID);
    });

  });
});
