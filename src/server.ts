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
    origin: ['https://admin.coket.io'],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

io.on('connection', (socket) => {
  let currentRoomName = '';
  let currentNickname = 'Anonymous';
  io.sockets.emit('change_room', getPublicRoomKeys());

  socket.on('enter_room', (roomName, nickname, done) => {
    currentRoomName = roomName;
    currentNickname = nickname;
    socket.join(roomName);
    done(currentRoomName, countRoomMembers(roomName));
    socket
      .to(roomName)
      .emit('welcome', currentNickname, countRoomMembers(roomName));
    io.sockets.emit('change_room', getPublicRoomKeys());
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('bye', currentNickname, countRoomMembers(room));
    });
  });

  socket.on('send_message', (textMessage, done) => {
    socket
      .to(currentRoomName)
      .emit('send_message', textMessage, currentNickname);
    done(textMessage);
  });

  socket.on('disconnect', () => {
    io.sockets.emit('change_room', getPublicRoomKeys());
  });
});

server.listen(8080, () => {
  console.log('Listening on port:8080');
});

function getPublicRoomKeys(): string[] {
  const { sids, rooms } = io.sockets.adapter;
  console.log(sids, rooms);
  const publicRooms: string[] = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoomMembers(roomName: string): number | undefined {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}
