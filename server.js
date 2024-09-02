const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const readline = require('readline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let users = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user join', (username) => {
    socket.username = username;
    users[username] = socket.id;
    io.emit('user joined', username);
    console.log(`${username} joined the chat`);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', { user: socket.username, message: msg });
    console.log(`${socket.username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    if (socket.username) {
      delete users[socket.username];
      io.emit('user left', socket.username);
      console.log(`${socket.username} left the chat`);
    }
  });
});

function broadcastMessage(message) {
  io.emit('broadcast message', message);
  console.log(`Broadcast message: ${message}`);
}

rl.on('line', (input) => {
  broadcastMessage(input);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Enter a message to broadcast to all users:');
});
