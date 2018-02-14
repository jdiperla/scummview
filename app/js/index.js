const Rectangle = require('./rectangle');

const Detector = require('./detector');
const Tools = require('./tools');
const Scumm3 = require('./scumm3/scumm3');
const Scumm4 = require('./scumm4/scumm4');

const RoomList = require('./ui/room_list');
const RoomImage = require('./ui/room_image');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let app = {};
let game;
let rooms = [];
let ui = {};

function createImageFromData(src, width, height) {
  if (src) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < imageData.data.length; i++) {
      imageData.data[i] = src[i];
    }
    ctx.putImageData(imageData, 0, 0);

    let image = new Image();
    image.src = canvas.toDataURL();

    return image;
  }
}

function showRoomDetail(room) {
  let roomImageData = game.getRoomImage(room);

  let roomDetailEl = document.getElementById('room-detail');
  roomDetailEl.style.display = 'initial';

  let numberEl = document.getElementById('room-id');
  let descEl = document.getElementById('room-desc');
  let dimensionsEl = document.getElementById('room-dimensions');
  let numObjectsEl = document.getElementById('room-num-objects');
  let imageEl = document.getElementById('room-image-container');

  numberEl.innerHTML = room.id;
  descEl.innerHTML = room.name ? room.name : '';
  dimensionsEl.innerHTML = room.width + ' x ' + room.height;
  numObjectsEl.innerHTML = room.numObjects;

  let canvas = document.createElement('canvas');
  if (roomImageData) {
    canvas.width = room.width;
    canvas.height = room.height;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < imageData.data.length; i++) {
      imageData.data[i] = roomImageData[i];
    }
    ctx.putImageData(imageData, 0, 0);
    let image = new Image();
    image.style.pointerEvents = 'none';
    image.src = canvas.toDataURL();
    ui.roomImage.setImage(image);

    imageEl.style.display = 'initial';
  } else {
    imageEl.style.display = 'none';
  }

  let objectsEl = document.getElementById('room-objects');
  // let objectsEl = document.getElementById('room-objects');
  objectsEl.innerHTML = '';

  if (room.objects) {
    for (var i = 0; i < room.objects.length; i++) {
      let ob = room.objects[i];

      let xPos = ob.xPos;
      let yPos = ob.yPos;
      let id = ob.id;
      let number = ob.number;
      let width = ob.width;
      let height = ob.height;

      let el = document.createElement('div');
      el.classList.add('room-object');
      el.innerHTML = `${number} [${xPos}, ${yPos}] [${width}, ${height}]`;

      let imEl = document.createElement('div');
      let pixelData = game.getRoomObjectImage(room.id, ob.number);
      let image = createImageFromData(pixelData, ob.width, ob.height);
      if (image) imEl.appendChild(image);

      el.appendChild(imEl);

      objectsEl.appendChild(el);
    }

    // let ob = room.objects[1];
    // if (ob) {
    //   let el = document.createElement('div');
    //   el.innerHTML = `${ob.number} [${ob.xPos}, ${ob.yPos}] [${ob.width}, ${ob.height}]`;
    //   objectsEl.appendChild(el);
    //
    //   let pixelData = game.getRoomObjectImage(room.id, ob.number);
    //   let image = createImageFromData(pixelData, ob.width, ob.height);
    //   objectsEl.appendChild(image);
    // }
  }
}

function refreshRoomList(roomids) {
  rooms = [];

  ui.roomList.clear();

  for (var i = 0; i < roomids.length; i++) {
    let id = roomids[i];
    let room = game.getRoom(id);
    rooms[id] = room;
    ui.roomList.createListItem(room);
    setTimeout(() => {
      let room = rooms[id];
      let roomImageData = game.getRoomImage(room);
      ui.roomList.setThumbnail(room.id, room.width, room.height, roomImageData);
    }, Math.random()*20 + 25);
  }
}

function refreshElements() {

  let roomDetailEl = document.getElementById('room-detail');
  roomDetailEl.style.display = 'none';

  // el = document.getElementById('room-image');
  // if (el.firstChild) el.removeChild(el.firstChild);
  // document.getElementById('room-id').innerHTML = '';
  // document.getElementById('room-dimensions').innerHTML = '';
  // document.getElementById('room-num-objects').innerHTML = '';
  //
  // let objectsEl = document.getElementById('room-objects');
  // objectsEl.innerHTML = '';

  let roomids = game.getRoomList();
  roomids = roomids.slice(0, 24);
  console.log(roomids.length.toString(), 'rooms');
  refreshRoomList(roomids);

  let dropEl = document.getElementById('drop');
  dropEl.style.display = 'none';
}

function detect(rootPath) {
  let stats = fs.statSync(rootPath);
  if (stats.isDirectory()) {
    let detector = new Detector(rootPath);
    if (detector.version == 3) {
      game = new Scumm3(detector);
    }
    else if (detector.version == 4) {
      game = new Scumm4(detector);
    }
    if (game) {
      console.log(game.name);
      refreshElements();
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
  // console.log('menu');
}

function initEventListeners() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('drop', onDrop);
  window.addEventListener('dragover', onDragOver);
  window.addEventListener('dragenter', onDragEnter);
  window.addEventListener('dragend', onDragEnd);
  window.addEventListener('contextmenu', onContextMenu);
}

function createElements() {
  ui.roomList = new RoomList({el: document.getElementById('room-list')});
  ui.roomList.on('select', (id) => {
    showRoomDetail(rooms[id]);
  });
  ui.roomImage = new RoomImage({el: document.getElementById('room-image')});
}

function ready() {
  console.log('ready');

  initEventListeners();
  createElements();
}

window.onload = () => {
  ready();
}

window.app = app;
