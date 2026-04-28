const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let messages = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send existing messages to the new user
  socket.emit('initial_messages', messages);

  socket.on('send_message', (data) => {
    const message = {
      id: Date.now(),
      user: data.user,
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messages.push(message);
    // Broadcast to everyone including the sender
    io.emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
