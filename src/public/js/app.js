const socket = io();

const welcome = document.getElementById('welcome');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

welcome.querySelector('form').addEventListener('submit', onSubmitEnterRoom);

socket.on('welcome', (user, roomSize) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}, joined: ${roomSize}`;
  addMessage(`${user} has joined!`);
});

socket.on('bye', (user, roomSize) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}, joined: ${roomSize}`;
  addMessage(`${user} has left!`);
});

socket.on('send_message', (message, user) => {
  addMessage(`${user}: ${message}`);
});

socket.on('change_room', (rooms) => {
  const ul = welcome.querySelector('ul');
  ul.innerHTML = '';
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerText = room;
    ul.append(li);
  });
});

function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function onSubmitEnterRoom(event) {
  event.preventDefault();
  const roomNameInput = welcome.querySelector('#roomname-input');
  const nicknameInput = welcome.querySelector('#nickname-input');
  socket.emit(
    'enter_room',
    roomNameInput.value,
    nicknameInput.value,
    onSuccessEnterRoom
  );
  roomNameInput.value = '';
  nicknameInput.value = '';
}

function onSuccessEnterRoom(roomName, roomSize) {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}, joined: ${roomSize}`;

  welcome.hidden = true;
  room.hidden = false;

  const form = room.querySelector('form');
  form.addEventListener('submit', onSubmitEnterMessage);
}

function onSubmitEnterMessage(event) {
  event.preventDefault();
  const input = room.querySelector('input');

  socket.emit('send_message', input.value, (message) => {
    addMessage(`You: ${message}`);
  });
  input.value = '';
}
