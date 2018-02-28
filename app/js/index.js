
const Rectangle = require('./rectangle');
const Detector = require('./detector');
const Tools = require('./tools');
const Scumm3 = require('./scumm3/scumm3');
const Scumm4 = require('./scumm4/scumm4');

const html = require('./ui/html');
const Component = require('./ui/component');
const Pane = require('./ui/pane');
const RoomList = require('./ui/room_list');
const RoomDetail = require('./ui/room_detail');
const CharacterMap = require('./ui/character_map');

const Parser = require('./ui/parser');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let app = {};
let game;
let rooms = [];
let roomid = 0;
let ui = {};

// let thumbWidth = 128;
// let thumbHeight = 80;
let thumbWidth = 160;
let thumbHeight = 100;

function createThumbnailFromCanvas(image) {
  let canvas = document.createElement('canvas');
  if (image) {
    let ratio = (thumbWidth / image.width);
    let width = thumbWidth;
    let height = thumbHeight * ratio * (image.height / thumbHeight)

    canvas.width = thumbWidth;
    // canvas.height = thumbHeight;
    canvas.height = height;

    let ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(image, 0, 0, canvas.width, height);

    // ctx.strokeStyle = 'white';
    // ctx.lineWidth = 5;
    // ctx.beginPath();
    // ctx.rect(0.5, 0.5, canvas.width-1, canvas.height-1);
    // ctx.stroke();
  } else {
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;
  }

  return canvas;
}

function updateRoomList(roomids) {
  rooms = [];

  let items = [];

  for (var i = 0; i < roomids.length; i++) {
    let room = game.getRoom(roomids[i]);

    // let canvas = Tools.createCanvasFromBuffer(game.getRoomBitmap(room.id), room.width, room.height);
    // let thumbnail = createThumbnailFromCanvas(canvas);
    let thumbnail = createThumbnailFromCanvas(null);

    let item = {
      id: room.id,
      description: room.id,
      image: thumbnail
    };

    items.push(item);

    setTimeout(() => {
      let canvas = Tools.createCanvasFromBuffer(game.getRoomBitmap(room.id), room.width, room.height);
      let thumbnail = createThumbnailFromCanvas(canvas);
      ui.roomList.setThumbnail(room.id, thumbnail);
    }, Math.random() * 100 + 50);
  }

  ui.roomList.update({ items: items });


}

function updateElements() {
  let roomids = game.getRoomList();

  updateRoomList(roomids);

  let dropEl = document.getElementById('drop');
  dropEl.style.visibility = 'hidden';

  let charsetnum = 0;

  let model = { characters: [] };
  let charset = game.charsets[charsetnum];
  // if (game.charsets[1]) {
    // charset = game.charsets[1];
  // }

  for (var i = 0; i < charset.numChars; i++) {
    let ch = charset.getGlyph(i);
    // let ch = game.getCharsetItem(i);
    if (ch) {
      // let bitmap = game.getCharsetBitmap(i);
      let bitmap = charset.getBitmap(i);
      let image = Tools.createCanvasFromBuffer(bitmap, ch.width, ch.height);
      model.characters.push({ image: image, width: ch.width, height: ch.height });
    } else {
      model.characters.push({ width: 8, height: 8 });
    }
  }

  ui.characterMap.update(model);

  ui.roomDetail.hide();

  ui.roomList.reset();
  // ui.roomList.update();
}

function showRoomDetail(id) {
  roomid = id;

  let room = game.getRoom(id);
  let objects = [];
  for (var i = 0; i < room.objects.length; i++) {
    let ob = room.objects[i];
    let image = Tools.createCanvasFromBuffer(game.getRoomObjectBitmap(id, ob.number), ob.width, ob.height);
    // let image = Tools.createCanvasFromBuffer(null, ob.width, ob.height);
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
    image: Tools.createCanvasFromBuffer(game.getRoomBitmap(id), room.width, room.height),
    // image: Tools.createCanvasFromBuffer(null, room.width, room.height),
    objects: objects
  }

  ui.roomDetail.show();
  ui.roomDetail.reset();
  ui.roomDetail.update(model);
}

function createElements() {
  let main = document.querySelector('#app');

  ui.roomList = new RoomList();
  ui.roomList.on('select', (id) => {
    showRoomDetail(id);
  });
  ui.roomDetail = new RoomDetail();

  ui.roomContent = new Component({ el: html.div().class('room-content').dom() });
  ui.roomContent.dom().appendChild(ui.roomList.dom());
  ui.roomContent.dom().appendChild(ui.roomDetail.dom());

  ui.characterMap = new CharacterMap();

  ui.pane = new Pane();
  ui.pane.add({ component: ui.roomContent, title: 'Rooms' });
  ui.pane.add({ component: ui.characterMap, title: 'Charsets' });
  ui.pane.show(0);

  main.appendChild(ui.pane.dom());
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
    if (game) updateElements();
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

function ready() {
  console.log('ready');

  initEventListeners();
  createElements();
}

window.onload = () => {
  ready();
}

window.app = app;
