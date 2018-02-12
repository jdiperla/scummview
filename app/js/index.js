const Rectangle = require('./rectangle');

const Detector = require('./detector');
const Tools = require('./tools');
const Scumm3 = require('./scumm3');
const Scumm4 = require('./scumm4');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let app = {};
let game;

function getFileChecksum(filepath) {
  try {
    let data = fs.readFileSync(filepath);
    let result = Tools.checksum(data);
    return result;
  } catch (err) {
    console.log(err.message);
  }
}

function appendRoomImage(roomno, el) {
  if (!game) return;

  let room = game.getRoom(roomno);
  if (room) {
    let width = room.width;
    let height = room.height;
    let data = room.imageData;

    if (width > 0 && height > 0 && data) {
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      let ctx = canvas.getContext('2d');
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = data[i];
      }
      ctx.putImageData(imageData, 0, 0);

      let image = new Image();
      image.src = canvas.toDataURL();

      el ? el.appendChild(image) : document.body.appendChild(image);
    }
  }
}

function createRoomList(roomList) {
  let div = document.createElement('div');
  div.id = 'roomList';
  div.classList.add('room-list');
  for (var i = 0; i < roomList.length; i++) {
    let title = roomList[i];
    let el = document.createElement('div');
    el.dataset.id = title;
    el.classList.add('room-list-item');
    el.appendChild(document.createTextNode(title));
    el.onclick = (event) => {
      let id = event.target.dataset.id;
      appendRoomImage(id, event.target);
    };
    div.appendChild(el);
  }
  document.body.appendChild(div);
}

function detect(rootPath) {
  // let game;
  let stats = fs.statSync(rootPath);
  if (stats.isDirectory()) {
    let version = Detector.detectMajorVersion(rootPath);
    console.log('Major Version:', version);
    if (version == 3) {
      game = new Scumm3(rootPath);
    }
    else if (version == 4) {
      game = new Scumm4(rootPath);
    }
    let room;
    if (game) {
      let roomList = game.getRoomList();
      console.log(game.name);
      // console.log(roomList);
      if (version == 3) {
        createRoomList(roomList);
      } else if (version == 4) {
        createRoomList(roomList);
      }
    }
  }
}

function onKeyDown(event) {
}

function onDrop(event) {
  event.preventDefault();
  let files = event.dataTransfer.files;
  if (files[0]) {
    detect(files[0].path);
  }
}

function onDragOver(event) {
  event.preventDefault();
}

function onDragEnter(event) {
  event.preventDefault();
}

function onDragEnd(event) {
  event.preventDefault();
}

function onContextMenu() {
  // event.preventDefault();
  console.log('menu');
}

function initEventListeners() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('drop', onDrop);
  window.addEventListener('dragover', onDragOver);
  window.addEventListener('dragenter', onDragEnter);
  window.addEventListener('dragend', onDragEnd);
  window.addEventListener('contextmenu', onContextMenu);
}

function ready() {
  console.log('ready');

  initEventListeners();
}

window.onload = () => {
  ready();
}

// app.getPath = () => {
//   return app.path;
// }

window.app = app;
