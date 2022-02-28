import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  req;
  return res.render('home');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

io.on('connection', (socket) => {
  socket.on('join_room', (roomName: string) => {
    socket.join(roomName);
    socket.to(roomName).emit('welcome');
  });
  socket.on(
    'offer',
    (offer: RTCLocalSessionDescriptionInit, roomName: string) => {
      socket.to(roomName).emit('offer', offer);
    }
  );
  socket.on(
    'answer',
    (answer: RTCLocalSessionDescriptionInit, roomName: string) => {
      socket.to(roomName).emit('answer', answer);
    }
  );
  socket.on('ice', (iceCandidate: RTCIceCandidate, roomName: string) => {
    socket.to(roomName).emit('ice', iceCandidate);
  });
});

server.listen(8080, () => {
  console.log('Listening on port:8080');
});
