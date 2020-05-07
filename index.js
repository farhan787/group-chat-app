const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const PORT = process.env.PORT || 3000;
const usernames = {};

app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.render('index.ejs');
});

io.sockets.on('connection', (socket) => {
  socket.on('sendchat', (data) => {
    io.sockets.emit('updatechat', socket.username, data);
  });

  socket.on('adduser', (username) => {
    socket.username = username;

    usernames[username] = username;

    socket.emit('servernotification', {
      connected: true,
      toSelf: true,
      username: username,
    });

    socket.broadcast.emit('servernotification', {
      connected: true,
      username: username,
    });

    io.sockets.emit('updateusers', usernames);
  });

  socket.on('disconnect', () => {
    delete usernames[socket.username];

    io.sockets.emit('updateusers', usernames);

    socket.broadcast.emit('servernotification', { username: socket.username });
  });
});

server.listen(PORT, console.log(`Server listening on port ${PORT}`));
