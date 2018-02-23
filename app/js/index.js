const Rectangle = require('./rectangle');

const Detector = require('./detector');
const Tools = require('./tools');
const Scumm3 = require('./scumm3/scumm3');
const Scumm4 = require('./scumm4/scumm4');

const RoomList = require('./ui/room_list');
const RoomDetail = require('./ui/room_detail');
const CharacterMap = require('./ui/character_map');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let app = {};
let game;
let rooms = [];
let roomid = 0;
let ui = {};

let thumbWidth = 128;
let thumbHeight = 80;


function createThumbnailFromCanvas(image) {
  let canvas = document.createElement('canvas');
  if (image) {
    let ratio = (thumbWidth / image.width);
    let width = thumbWidth;
    let height = thumbHeight * ratio * (image.height / thumbHeight)

    canvas.width = thumbWidth;
    canvas.height = thumbHeight;

    let ctx = canvas.getContext('2d');
    // ctx.fillStyle = 'black';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(image, 0, 0, canvas.width, height);
  } else {
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;
  }

  return canvas;
}

function renderRoomList(roomids) {
  rooms = [];

  let items = [];

  for (var i = 0; i < roomids.length; i++) {
    let room = game.getRoom(roomids[i]);

    let bitmap = game.getRoomBitmap(room.id);
    let canvas = Tools.createCanvasFromBuffer(bitmap, room.width, room.height);
    let thumbnail = createThumbnailFromCanvas(canvas);

    let model = {
      id: room.id,
      description: room.id,
      image: thumbnail
    }
    items.push(model);
  }

  ui.roomList = new RoomList({ items: items });
  ui.roomList.on('select', (id) => {
    showRoomDetail(id);
  });

  return ui.roomList.render();
}

function refreshElements() {
  let roomids = game.getRoomList();
  console.log(roomids.length, 'rooms');

  let roomListContainerEl = document.getElementById('room-list-container');
  let roomListEl = renderRoomList(roomids);

  if (roomListContainerEl.firstChild)
    roomListContainerEl.removeChild(roomListContainerEl.firstChild);

  roomListContainerEl.appendChild(roomListEl);


  let dropEl = document.getElementById('drop');
  dropEl.style.visibility = 'hidden';


  let el = document.getElementById('room-detail-container');
  while (el.firstChild) el.removeChild(el.firstChild);


  let model = { characters: [] };
  let charset = game.charsets[0];

  for (var i = 0; i < charset.numChars; i++) {
    let ch = charset.getGlyph(i);
    // let ch = game.getCharsetItem(i);
    if (ch) {
      let bitmap = game.getCharsetBitmap(i);
      let image = Tools.createImageFromBuffer(bitmap, ch.width, ch.height);
      model.characters.push({ width: ch.width, height: ch.height, image: image });
    } else {
      model.characters.push({ width: 8, height: 8 });
    }
  }

  ui.characterMap = new CharacterMap(model);
  let characterMapContainerEl = document.getElementById('character-map-container');
  if (characterMapContainerEl) {
    if (characterMapContainerEl.firstChild)
      characterMapContainerEl.removeChild(characterMapContainerEl.firstChild);
    characterMapContainerEl.appendChild(ui.characterMap.render());
  }
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
    if (game) refreshElements();
  }
}


function showRoomDetail(id) {

  // if (roomid == id) return;
  roomid = id;

  // console.log('showRoomDetail', id);
  // console.log('showRoomDetail', id);
  let el = document.getElementById('room-detail-container');
  // el.style.height = '640px';
  while (el.firstChild) el.removeChild(el.firstChild);

  // let room = game.getRoom(id);
  // ui.roomDetail.room = room;
  // ui.roomDetail.bitmap = game.getRoomBitmap(room.id);
  // let bitmaps = [];
  // let masks = [];
  // for (var i = 0; i < room.objects.length; i++) {
  //   let ob = room.objects[i];
  //   let image = game.getRoomObjectBitmap(id, ob.number);
  //   bitmaps.push(image);
  // }
  // ui.roomDetail.objectBitmaps = bitmaps;
  // ui.roomDetail.objectMasks = masks;
  // ui.roomDetail.render();
  // ui.roomDetail.show();

  let room = game.getRoom(id);
  let objects = [];
  for (var i = 0; i < room.objects.length; i++) {
    let ob = room.objects[i];
    let image = Tools.createImageFromBuffer(game.getRoomObjectBitmap(id, ob.number), ob.width, ob.height);
    // bitmaps.push(image);
    objects.push({
      number: ob.number,
      x_pos: ob.x_pos,
      y_pos: ob.y_pos,
      width: ob.width,
      height: ob.height,
      name: ob.name,
      parent: ob.parent,
      parentstate: ob.parentstate,
      bytes: ob.bytes,
      image: image,
    });
  }
  let model = {
    id: room.id,
    name: room.name,
    width: room.width,
    height: room.height,
    image: Tools.createImageFromBuffer(game.getRoomBitmap(id), room.width, room.height),
    objects: objects
  }

  let roomDetail = new RoomDetail(model);
  el.appendChild(roomDetail.render());
}

function createElements() {
  // let el = document.getElementById('room-list-container');
  // let model = {};
  // ui.roomList = new RoomList(model);
  // el.appendChild(ui.roomList.render());
  // ui.roomDetail = new RoomDetail(model);
  // ui.roomDetail.hide();
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

function ready() {
  console.log('ready');

  initEventListeners();
  createElements();
}

window.onload = () => {
  ready();
}

window.app = app;
