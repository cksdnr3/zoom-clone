const socket = io();

// Browser Code

const myVideo = document.getElementById('my-video');
const muteButton = document.getElementById('mute');
const cameraOffButton = document.getElementById('camera-off');
const camerasSelect = document.getElementById('cameras');
const welcome = document.getElementById('welcome');
const call = document.getElementById('call');
const welcomeForm = welcome.querySelector('form');

call.hidden = true;

let myStream = null;
let audioOff = false;
let cameraOff = false;
let roomName = null;
let peerConnection = null;

muteButton.addEventListener('click', onClickMuteButton);
cameraOffButton.addEventListener('click', onClickCameraOffButton);
camerasSelect.addEventListener('input', onChangeCamera);
welcomeForm.addEventListener('submit', onSubmitWelcomeForm);

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConection();
}

async function onSubmitWelcomeForm(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector('input');
  await startMedia();
  socket.emit('join_room', input.value);
  roomName = input.value;
  input.value = '';
}

async function onChangeCamera() {
  try {
    await getMedia(camerasSelect.value);
  } catch (e) {
    console.log(e);
  }
}

function onClickMuteButton() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (audioOff) {
    muteButton.innerText = 'Mute';
    audioOff = false;
  } else {
    muteButton.innerText = 'Unmute';
    audioOff = true;
  }
}
function onClickCameraOffButton() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  if (cameraOff) {
    cameraOffButton.innerText = 'Camera-Off';
    cameraOff = false;
  } else {
    cameraOffButton.innerText = 'Camera-On';
    cameraOff = true;
  }
}

async function getUserCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  try {
    const defaultConstrains = {
      audio: true,
      video: { facingMode: 'user' },
    };
    const cameraConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : defaultConstrains
    );
    myVideo.srcObject = myStream;
    if (!deviceId) {
      await getUserCameras();
    }
  } catch (e) {}
}

// Socket.io Code

socket.on('welcome', async () => {
  const offer = await peerConnection.createOffer();
  peerConnection.setLocalDescription(offer);
  socket.emit('offer', offer, roomName);
});

socket.on('offer', async (offer) => {
  peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  peerConnection.setLocalDescription(answer);
  socket.emit('answer', answer, roomName);
});

socket.on('answer', (answer) => {
  peerConnection.setRemoteDescription(answer);
});

socket.on('ice', (iceCandidate) => {
  peerConnection.addIceCandidate(iceCandidate);
});

// RTC Code

function makeConection() {
  peerConnection = new RTCPeerConnection();
  peerConnection.addEventListener('icecandidate', onIceCandidate);
  peerConnection.addEventListener('track', onTrack);
  myStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, myStream);
  });
}

function onIceCandidate(event) {
  socket.emit('ice', event.candidate, roomName);
}
function onTrack(event) {
  const peerVideo = document.getElementById('peer-video');
  peerVideo.srcObject = event.streams[0];
}
