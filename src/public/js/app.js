const socket = io();

const myVideo = document.getElementById('my-video');
const muteButton = document.getElementById('mute');
const cameraOffButton = document.getElementById('camera-off');

let myStream = null;
let audioOff = false;
let cameraOff = false;

muteButton.addEventListener('click', onClickMuteButton);
cameraOffButton.addEventListener('click', onClickCameraOffButton);

function onClickMuteButton() {
  if (audioOff) {
    muteButton.innerText = 'Mute';
    audioOff = false;
  } else {
    muteButton.innerText = 'Unmute';
    audioOff = true;
  }
}
function onClickCameraOffButton() {
  if (cameraOff) {
    cameraOffButton.innerText = 'Camera-Off';
    cameraOff = false;
  } else {
    cameraOffButton.innerText = 'Camera-On';
    cameraOff = true;
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    // myVideo.srcObject = myStream;
  } catch (e) {}
}

getMedia();
